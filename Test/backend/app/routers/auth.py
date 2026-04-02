import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.config import settings
from app.database import get_db
from app.models import PendingRegistration, RefreshToken, User
from app.schemas import (
    LoginRequest,
    RegisterStep1Response,
    TokenRefreshResponse,
    TokenResponse,
    UserResponse,
    VerificationRequest,
    VerificationResponse,
    UserCreate,
)
from app.auth import (
    create_access_token,
    create_refresh_token,
    hash_refresh_token,
    verify_password,
    get_password_hash,
)
from app.services.email import create_verification_code, verify_code, send_verification_email
from app.dependencies import get_current_user

router = APIRouter(prefix="/api", tags=["auth"])
logger = logging.getLogger(__name__)

_REFRESH_COOKIE = "refresh_token"
_COOKIE_MAX_AGE = settings.refresh_token_expire_days * 86_400  # seconds


def _set_refresh_cookie(response: Response, raw_token: str) -> None:
    response.set_cookie(
        key=_REFRESH_COOKIE,
        value=raw_token,
        httponly=True,
        secure=settings.SECURE_COOKIES,
        samesite="lax",
        max_age=_COOKIE_MAX_AGE,
        path="/api",
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(key=_REFRESH_COOKIE, path="/api")


# ─── Registration ────────────────────────────────────────────────────────────

@router.post("/register", response_model=RegisterStep1Response)
async def register_step1(
    request: Request,
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    email = user_data.email.lower().strip()

    # Purge any expired pending registration for this email
    await db.execute(
        delete(PendingRegistration).where(PendingRegistration.email == email)
    )

    existing = await db.scalar(select(User).where(User.email == email))
    if existing:
        # Generic response to avoid email enumeration
        return RegisterStep1Response(
            success=True,
            message=f"If this email is new, a verification code has been sent to {email}",
            email=email,
        )

    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.EMAIL_VERIFICATION_EXPIRE_MINUTES
    )
    pending = PendingRegistration(
        email=email,
        name=user_data.name,
        last_name=user_data.last_name,
        password_hash=get_password_hash(user_data.password),
        expires_at=expires_at,
    )
    db.add(pending)
    await db.commit()

    code = await create_verification_code(db, email)
    email_sent = await send_verification_email(to_email=email, code=code, name=user_data.name)

    if not email_sent and settings.SMTP_USER:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not send verification email. Please try again later.",
        )

    return RegisterStep1Response(
        success=True,
        message=f"If this email is new, a verification code has been sent to {email}",
        email=email,
    )


@router.post("/verify", response_model=VerificationResponse)
async def verify_and_complete(
    request: Request,
    verification: VerificationRequest,
    db: AsyncSession = Depends(get_db),
):
    email = verification.email.lower().strip()

    is_valid = await verify_code(db, email, verification.code)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code",
        )

    pending = await db.scalar(
        select(PendingRegistration).where(
            PendingRegistration.email == email,
            PendingRegistration.expires_at > datetime.now(timezone.utc),
        )
    )
    if not pending:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration session expired. Please register again.",
        )

    new_user = User(
        email=email,
        password=pending.password_hash,
        name=pending.name,
        last_name=pending.last_name,
        is_verified=True,
        group_id=None,
    )
    db.add(new_user)
    await db.execute(delete(PendingRegistration).where(PendingRegistration.email == email))
    await db.commit()

    return VerificationResponse(success=True, message="Account created successfully! Please login.")


# ─── Login / Logout / Refresh ─────────────────────────────────────────────────

@router.post("/login", response_model=TokenResponse)
async def login(
    request: Request,
    login_data: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    email = login_data.email.lower().strip()

    user = await db.scalar(select(User).where(User.email == email))
    if not user or not verify_password(login_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email address not verified. Please check your inbox.",
        )

    access_token = create_access_token(data={"sub": user.id})
    raw_refresh, refresh_hash = create_refresh_token()

    db.add(
        RefreshToken(
            token_hash=refresh_hash,
            user_id=user.id,
            expires_at=datetime.now(timezone.utc)
            + timedelta(days=settings.refresh_token_expire_days),
        )
    )
    await db.commit()

    _set_refresh_cookie(response, raw_refresh)
    return TokenResponse(access_token=access_token, user=UserResponse.model_validate(user))


@router.post("/refresh", response_model=TokenRefreshResponse)
async def refresh_access_token(
    response: Response,
    refresh_token: str | None = Cookie(default=None, alias=_REFRESH_COOKIE),
    db: AsyncSession = Depends(get_db),
):
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No refresh token")

    token_hash = hash_refresh_token(refresh_token)
    stored = await db.scalar(
        select(RefreshToken).where(
            RefreshToken.token_hash == token_hash,
            RefreshToken.revoked == False,  # noqa: E712
            RefreshToken.expires_at > datetime.now(timezone.utc),
        )
    )
    if not stored:
        _clear_refresh_cookie(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    # Rotate: revoke old, issue new
    stored.revoked = True
    raw_new, hash_new = create_refresh_token()
    db.add(
        RefreshToken(
            token_hash=hash_new,
            user_id=stored.user_id,
            expires_at=datetime.now(timezone.utc)
            + timedelta(days=settings.refresh_token_expire_days),
        )
    )
    await db.commit()

    _set_refresh_cookie(response, raw_new)
    access_token = create_access_token(data={"sub": stored.user_id})
    return TokenRefreshResponse(access_token=access_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    response: Response,
    refresh_token: str | None = Cookie(default=None, alias=_REFRESH_COOKIE),
    db: AsyncSession = Depends(get_db),
):
    if refresh_token:
        token_hash = hash_refresh_token(refresh_token)
        stored = await db.scalar(
            select(RefreshToken).where(RefreshToken.token_hash == token_hash)
        )
        if stored:
            stored.revoked = True
            await db.commit()
    _clear_refresh_cookie(response)


# ─── Current user ─────────────────────────────────────────────────────────────

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
