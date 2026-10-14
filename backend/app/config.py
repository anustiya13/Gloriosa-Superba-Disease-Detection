# ============================================================
# config.py — Application configuration using Pydantic Settings
# All values loaded from .env file or environment variables.
# ============================================================

from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    # ── App ─────────────────────────────────────────────────
    APP_NAME: str = "Gloriosa AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # ── Database ─────────────────────────────────────────────
    DATABASE_URL: str = "mysql+pymysql://root:password@localhost:3306/gloriosa_ai"

    # ── JWT ──────────────────────────────────────────────────
    SECRET_KEY: str = "change-this-secret-key-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    # ── Mock Modes ───────────────────────────────────────────
    MOCK_AI: bool = True    # Use mock predictions (no real model)
    MOCK_OTP: bool = True   # Use fixed OTP "123456" for testing

    # ── Upload ───────────────────────────────────────────────
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE_MB: int = 10
    ALLOWED_EXTENSIONS: str = "jpg,jpeg,png,webp"

    # ── CORS ─────────────────────────────────────────────────
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        case_sensitive = True

    @property
    def max_file_size_bytes(self) -> int:
        return self.MAX_FILE_SIZE_MB * 1024 * 1024

    @property
    def allowed_extensions_set(self) -> set:
        return {ext.strip().lower() for ext in self.ALLOWED_EXTENSIONS.split(",")}


# Singleton settings instance
settings = Settings()
