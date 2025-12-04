"""Application configuration for Edu Learn Pro backend."""

from functools import lru_cache
from typing import Any

from pydantic import Field

try:  # Pydantic v2
    from pydantic_settings import BaseSettings
except ImportError:  # Fallback for Pydantic v1
    from pydantic import BaseSettings


class Settings(BaseSettings):
    """Define environment-backed application settings."""

    project_name: str = "Edu Learn Pro API"
    api_v1_prefix: str = "/api/v1"
    frontend_origin: str = "http://localhost:5173"

    secret_key: str = Field(..., env="SECRET_KEY")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 24 hours

    database_url: str = Field(..., env="DATABASE_URL")

    smtp_enabled: bool = False

    class Config:
        env_file = ".env"
        case_sensitive = False

    def as_dict(self) -> dict[str, Any]:
        """Expose settings as a dictionary (excluding secrets)."""
        return {
            "project_name": self.project_name,
            "api_v1_prefix": self.api_v1_prefix,
            "frontend_origin": self.frontend_origin,
            "access_token_expire_minutes": self.access_token_expire_minutes,
            "database_url": self.database_url,
        }


@lru_cache
def get_settings() -> Settings:
    """Return cached settings instance."""

    return Settings()
