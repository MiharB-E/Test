from pydantic_settings import BaseSettings
from functools import lru_cache
import logging

logger = logging.getLogger(__name__)

_INSECURE_KEY_PREFIX = "CHANGE-IN-PRODUCTION"


class Settings(BaseSettings):
    app_name: str = "InvCasa"
    app_version: str = "1.0.0"
    debug: bool = False

    database_url: str = "sqlite+aiosqlite:////app/data/invcasa.db"

    # Use long, random values in production.
    # The app will log a loud warning if these default values are still in use.
    secret_key: str = f"{_INSECURE_KEY_PREFIX}-ACCESS-00000000000000000000000000000000"
    refresh_token_secret_key: str = f"{_INSECURE_KEY_PREFIX}-REFRESH-0000000000000000000000000000"

    algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 30

    # Email – leave empty to disable sending (app will warn but won't crash)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = ""
    SMTP_FROM_NAME: str = "InvCasa"
    EMAIL_VERIFICATION_EXPIRE_MINUTES: int = 30

    FRONTEND_URL: str = "http://localhost:5173"

    # Set to True only in local dev/testing to seed a demo user on startup
    SEED_DEMO_DATA: bool = False

    # Set to True in production (HTTPS) so cookies are Secure
    SECURE_COOKIES: bool = False

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    def warn_if_insecure(self) -> None:
        """Call during app startup to surface dangerous misconfigurations."""
        if _INSECURE_KEY_PREFIX in self.secret_key:
            logger.critical(
                "SECRET_KEY is using the insecure default value. "
                "Set a strong random key in your .env file before going to production!"
            )
        if _INSECURE_KEY_PREFIX in self.refresh_token_secret_key:
            logger.critical(
                "REFRESH_TOKEN_SECRET_KEY is using the insecure default value. "
                "Set a strong random key in your .env file before going to production!"
            )
        if self.debug:
            logger.warning("DEBUG mode is enabled – disable in production.")


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings() 