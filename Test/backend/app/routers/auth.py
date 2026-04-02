from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import logging

from app.database import get_db
from app.models import User
from app.schemas import (
    UserCreate, LoginRequest, TokenResponse, UserResponse,
    VerificationRequest, VerificationResponse, RegisterStep1Response
)
from app.auth import (
    verify_password, get_password_hash, create_access_token
)
from app.services.email import (
    create_verification_code, verify_code, send_verification_email
)
from app.dependencies import get_current_user

router = APIRouter(prefix="/api", tags=["auth"])
logger = logging.getLogger(__name__)


@router.post("/register", response_model=RegisterStep1Response)
async def register_step1(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    email = user_data.email.lower().strip()

    result = await db.execute(
        select(User).where(User.email == email)
    )
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    code = await create_verification_code(db, email)
    
    email_sent = await send_verification_email(
        to_email=email,
        code=code,
        name=user_data.name
    )
    
    if not email_sent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not send verification email. Please check your email address."
        )
    
    if not hasattr(router, 'temp_registrations'):
        router.temp_registrations = {}
    
    router.temp_registrations[email] = {
        "name": user_data.name,
        "last_name": user_data.last_name,
        "password": user_data.password
    }
        
    return RegisterStep1Response(
        success=True,
        message=f"Verification code sent to {email}",
        email=email
    )


@router.post("/verify", response_model=VerificationResponse)
async def verify_and_complete(
    verification: VerificationRequest,
    db: AsyncSession = Depends(get_db)
):
    email = verification.email.lower().strip()

    is_valid = await verify_code(db, email, verification.code)
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code"
        )
    
    temp_data = getattr(router, 'temp_registrations', {}).get(email)
    
    if not temp_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration session expired. Please register again."
        )
    
    name = temp_data.get("name")
    last_name = temp_data.get("last_name")
    password = temp_data.get("password")
    
    hashed_password = get_password_hash(password)
    new_user = User(
        email=email,
        password=hashed_password,
        name=name,
        last_name=last_name,
        group_id=None
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    del router.temp_registrations[email]
    
    return VerificationResponse(
        success=True,
        message="Account created successfully! Please login."
    )


@router.post("/login", response_model=TokenResponse)
async def login(login_data: LoginRequest, db: AsyncSession = Depends(get_db)):
    email = login_data.email.lower().strip()

    result = await db.execute(
        select(User).where(User.email == email)
    )
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(login_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    access_token = create_access_token(data={"sub": user.id})
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse.model_validate(user)
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user