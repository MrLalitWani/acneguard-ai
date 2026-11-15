import os
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App environment
    ENVIRONMENT: str = "development"
    PROJECT_NAME: str = "AcneGuard AI"
    VERSION: str = "1.0.0"

    # Security & Tokens
    SECRET_KEY: str = "9a7c36a2de69d71c4c1a5b4f8d2e8b8c1d9f0a2e5c8b7f9d0c6a5e4f3c2b1a0d"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours in production

    # Database
    DATABASE_URL: str = "sqlite:///./acneguard.db"
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20

    # CORS configuration
    CORS_ORIGINS: Union[str, List[str]] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:80"
    ]

    # File upload limits
    MAX_UPLOAD_SIZE_MB: int = 10

    @field_validator("CORS_ORIGINS", mode="before")
    def parse_cors_origins(cls, v):
        if isinstance(v, str) and not v.startswith("["):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
