import html
import logging
import secrets
from datetime import datetime, timedelta, timezone

import aiosmtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.config import settings
from app.models import EmailVerification

logger = logging.getLogger(__name__)


def generate_verification_code() -> str:
    """Generate a cryptographically-secure 6-digit verification code."""
    return "".join(str(secrets.randbelow(10)) for _ in range(6))


async def create_verification_code(db: AsyncSession, email: str) -> str:
    """Create and persist a verification code for the given email."""
    await db.execute(delete(EmailVerification).where(EmailVerification.email == email))

    code = generate_verification_code()
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.EMAIL_VERIFICATION_EXPIRE_MINUTES
    )

    verification = EmailVerification(email=email, code=code, expires_at=expires_at)
    db.add(verification)
    await db.commit()
    return code


async def verify_code(db: AsyncSession, email: str, code: str) -> bool:
    """Return True and mark the code as used if it is valid and unexpired."""
    result = await db.execute(
        select(EmailVerification).where(
            EmailVerification.email == email,
            EmailVerification.code == code,
            EmailVerification.expires_at > datetime.now(timezone.utc),
            EmailVerification.verified == False,  # noqa: E712
        )
    )
    verification = result.scalar_one_or_none()

    if verification:
        verification.verified = True
        await db.commit()
        return True

    return False


async def send_verification_email(to_email: str, code: str, name: str) -> bool:
    """Send a verification e-mail.  Returns False and logs if SMTP is not configured."""
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.warning("SMTP not configured – skipping verification email for %s", to_email)
        return False

    safe_name = html.escape(name)
    safe_code = html.escape(code)
    expire_minutes = settings.EMAIL_VERIFICATION_EXPIRE_MINUTES

    subject = "Bienvenido a InvCasa – Código de verificación"

    html_content = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Verifica tu cuenta</title>
  <style>
    body{{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f7f5ff;margin:0;padding:0}}
    .container{{max-width:600px;margin:40px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,.1)}}
    .header{{background:linear-gradient(135deg,#7e22ce,#a855f7);padding:30px;text-align:center}}
    .header h1{{color:#fff;margin:0;font-size:28px}}
    .content{{padding:40px 30px;text-align:center}}
    .code{{font-size:48px;font-weight:700;letter-spacing:8px;color:#7e22ce;background:#f3e8ff;padding:20px;border-radius:12px;display:inline-block;margin:20px 0;font-family:monospace}}
    .footer{{padding:20px;text-align:center;background:#f9fafb;color:#6b7280;font-size:12px}}
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>✨ InvCasa ✨</h1></div>
    <div class="content">
      <h2>¡Hola, {safe_name}! 👋</h2>
      <p>Gracias por registrarte en InvCasa. Para verificar tu cuenta usa el siguiente código:</p>
      <div class="code">{safe_code}</div>
      <p>Este código expirará en {expire_minutes} minutos.</p>
      <p>Si no solicitaste este registro, ignora este mensaje.</p>
    </div>
    <div class="footer">
      <p>InvCasa – Gestión inteligente de tus gastos de hogar</p>
      <p>© 2026 InvCasa. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>"""

    text_content = (
        f"Hola {name},\n\n"
        f"Tu código de verificación es: {code}\n\n"
        f"Expira en {expire_minutes} minutos.\n\n"
        f"Si no solicitaste este registro, ignora este mensaje.\n\n"
        f"-- InvCasa"
    )

    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
    message["To"] = to_email
    message.attach(MIMEText(text_content, "plain"))
    message.attach(MIMEText(html_content, "html"))

    try:
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            start_tls=True,
        )
        logger.info("Verification email sent to %s", to_email)
        return True
    except Exception as exc:
        logger.error("Error sending verification email to %s: %s", to_email, exc)
        return False


async def send_product_request_email(
    product_name: str,
    notes: str | None,
    requester: str | None = None,
) -> bool:
    """Notify the app admin of a new product request."""
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD or not settings.SMTP_FROM_EMAIL:
        logger.warning("SMTP not configured – skipping product request email")
        return False

    subject = "Nueva solicitud de producto (InvCasa)"
    body = (
        f"Nueva solicitud de producto:\n\n"
        f"Producto: {product_name}\n"
        f"Notas: {notes or '-'}\n"
        f"Usuario: {requester or 'N/D'}\n"
    )

    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
    message["To"] = settings.SMTP_FROM_EMAIL
    message.attach(MIMEText(body, "plain"))

    try:
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            start_tls=True,
        )
        logger.info("Product request email sent")
        return True
    except Exception as exc:
        logger.error("Error sending product request email: %s", exc)
        return False