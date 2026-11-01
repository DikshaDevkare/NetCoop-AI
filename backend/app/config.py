"""
Centralized application configuration for NetCoop AI Backend.

Uses Pydantic Settings to load and validate environment variables with safe
development defaults and support for local .env files.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings model defining configuration parameters and their defaults.
    Values can be overridden via environment variables or a local .env file.
    """

    APP_NAME: str = "NetCoop AI Backend"
    APP_VERSION: str = "0.1.0"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_PREFIX: str = "/api"
    LOG_LEVEL: str = "INFO"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"
    DATABASE_URL: str = "sqlite:///./netcoop.db"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def allowed_origins_list(self) -> list[str]:
        """
        Parse ALLOWED_ORIGINS into a clean list of origin strings.
        Supports comma-separated strings or a single origin.
        """
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    """
    Factory function returning a cached Settings instance.
    Prevents redundant reads and re-instantiation across modules.
    """
    return Settings()


# Shared singleton instance for convenient import across future modules
settings: Settings = get_settings()
