from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    app_name: str = "InvCasa"
    app_version: str = "1.0.0"
    debug: bool = True
    
    database_url: str = "sqlite+aiosqlite:///./invcasa.db"
    secret_key: str = "your-super-secret-key-change-this-in-production"
    algorithm: str = "HS256"
    # CAMBIA ESTA LÍNEA: 30 años = 15,768,000 minutos
    access_token_expire_minutes: int = 15768000

    # Email configuration
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = "invcasa.info@gmail.com"
    SMTP_PASSWORD: str = "zuhg xtdc oggl lhlm"
    SMTP_FROM_EMAIL: str = "invcasa.info@gmail.com"
    SMTP_FROM_NAME: str = "InvCasa"
    EMAIL_VERIFICATION_EXPIRE_MINUTES: int = 30

    FRONTEND_URL: str = "http://localhost:5173"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings():
    return Settings()


settings = get_settings() 