"""
Tasky Backend — Application Configuration

Loads settings from environment variables / .env file.
Optimized for production deployment across Render, Railway, AWS ECS, and local Docker.
"""

from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=(".env", ".env.production"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ──────────────────────────────────────────
    APP_NAME: str = "Tasky"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "production"
    DEBUG: bool = False
    PORT: int = 8000

    # ── CORS Origins ─────────────────────────────────────────
    ALLOWED_ORIGINS: Union[str, List[str]] = "*"
    CORS_ORIGINS: List[str] = ["*"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.strip() == "*":
                return ["*"]
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["*"]

    # ── Database ─────────────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://tasky_user:tasky_password@localhost:5432/tasky_db"

    @property
    def async_database_url(self) -> str:
        """
        Normalize DATABASE_URL for asyncpg.
        Handles provider formats (e.g., Render/Supabase postgres:// or postgresql://).
        """
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgresql://") and not url.startswith("postgresql+asyncpg://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url

    @property
    def database_url_sync(self) -> str:
        """Return a synchronous database URL for Alembic migrations."""
        url = self.DATABASE_URL
        # Normalize all postgres URL variants to postgresql+psycopg2://
        if url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql+psycopg2://", 1)
        elif url.startswith("postgresql+asyncpg://"):
            return url.replace("postgresql+asyncpg://", "postgresql+psycopg2://", 1)
        elif url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+psycopg2://", 1)
        return url

    # ── JWT Authentication ───────────────────────────────────
    JWT_SECRET_KEY: str = "tasky-production-super-secret-jwt-key-2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 14

    # ── LMS Sync ─────────────────────────────────────────────
    DEFAULT_LMS_URL: str = "https://my.smccnasipit.edu.ph"
    LMS_SYNC_INTERVAL_MINUTES: int = 5
    LMS_ENCRYPTION_KEY: str = "tasky-production-lms-encryption-32"
    LMS_TEST_USERNAME: str = ""
    LMS_TEST_PASSWORD: str = ""

    # ── Push Notifications & Queue ───────────────────────────
    FIREBASE_CREDENTIALS_PATH: str = ""
    REDIS_URL: str = "redis://localhost:6379/0"


settings = Settings()
