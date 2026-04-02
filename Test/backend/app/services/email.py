import smtplib
import random
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.config import settings
from app.models import EmailVerification


def generate_verification_code() -> str:
    """Generate a 6-digit verification code"""
    return ''.join(random.choices('0123456789', k=6))


async def create_verification_code(db: AsyncSession, email: str) -> str:
    """Create and store a verification code for email"""
    
    # Delete any existing codes for this email
    await db.execute(
        delete(EmailVerification).where(EmailVerification.email == email)
    )
    
    # Generate new code
    code = generate_verification_code()
    expires_at = datetime.utcnow() + timedelta(minutes=settings.EMAIL_VERIFICATION_EXPIRE_MINUTES)
    
    verification = EmailVerification(
        email=email,
        code=code,
        expires_at=expires_at
    )
    db.add(verification)
    await db.commit()
    
    return code


async def verify_code(db: AsyncSession, email: str, code: str) -> bool:
    """Verify if the code is valid"""
    
    result = await db.execute(
        select(EmailVerification).where(
            EmailVerification.email == email,
            EmailVerification.code == code,
            EmailVerification.expires_at > datetime.utcnow(),
            EmailVerification.verified == False
        )
    )
    verification = result.scalar_one_or_none()
    
    if verification:
        verification.verified = True
        await db.commit()
        return True
    
    return False


async def send_verification_email(to_email: str, code: str, name: str) -> bool:
    """Send verification email with code"""
    
    subject = "Bienvenido a InvCasa - Código de verificación"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Verifica tu cuenta</title>
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f7f5ff;
                margin: 0;
                padding: 0;
            }}
            .container {{
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            }}
            .header {{
                background: linear-gradient(135deg, #7e22ce, #a855f7);
                padding: 30px;
                text-align: center;
            }}
            .header h1 {{
                color: white;
                margin: 0;
                font-size: 28px;
            }}
            .content {{
                padding: 40px 30px;
                text-align: center;
            }}
            .code {{
                font-size: 48px;
                font-weight: bold;
                letter-spacing: 8px;
                color: #7e22ce;
                background-color: #f3e8ff;
                padding: 20px;
                border-radius: 12px;
                display: inline-block;
                margin: 20px 0;
                font-family: monospace;
            }}
            .footer {{
                padding: 20px;
                text-align: center;
                background-color: #f9fafb;
                color: #6b7280;
                font-size: 12px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✨ InvCasa ✨</h1>
            </div>
            <div class="content">
                <h2>¡Hola, {name}! 👋</h2>
                <p>Gracias por registrarte en InvCasa. Para verificar tu cuenta, usa el siguiente código:</p>
                <div class="code">{code}</div>
                <p>Este código expirará en {settings.EMAIL_VERIFICATION_EXPIRE_MINUTES} minutos.</p>
                <p>Si no solicitaste este registro, ignora este mensaje.</p>
            </div>
            <div class="footer">
                <p>InvCasa - Gestión inteligente de tus gastos de hogar</p>
                <p>© 2026 InvCasa. Todos los derechos reservados.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
Hola {name},

Gracias por registrarte en InvCasa.

Tu código de verificación es: {code}

Este código expirará en {settings.EMAIL_VERIFICATION_EXPIRE_MINUTES} minutos.

Si no solicitaste este registro, ignora este mensaje.

---
InvCasa - Gestión inteligente de tu hogar
"""
    
    try:
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
        message["To"] = to_email
        
        part_text = MIMEText(text_content, "plain")
        part_html = MIMEText(html_content, "html")
        
        message.attach(part_text)
        message.attach(part_html)
        
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(message)
        
        print(f"✅ Email sent to {to_email} with code {code}")
        return True
        
    except Exception as e:
        print(f"❌ Error sending email: {e}")
        return False