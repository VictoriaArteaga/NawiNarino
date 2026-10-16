from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Nawi-Narino API"
    environment: str = "development"
    data_source: Literal["mock", "database"] = "mock"
    database_url: str | None = None
    cors_origins: list[str] = [
        "http://localhost:8081",
        "http://127.0.0.1:8081",
    ]

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[2] / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @field_validator("database_url", mode="before")
    @classmethod
    def normalize_database_url(cls, value: object) -> object:
        if isinstance(value, str) and not value.strip():
            return None
        return value

    @model_validator(mode="after")
    def require_database_url_for_database_mode(self) -> "Settings":
        if self.data_source == "database" and not self.database_url:
            raise ValueError(
                "DATABASE_URL is required when DATA_SOURCE=database"
            )
        if (
            self.data_source == "database"
            and self.database_url is not None
            and not self.database_url.startswith("postgresql")
        ):
            raise ValueError("DATABASE_URL must use PostgreSQL")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
