import secrets
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
    # Autenticación. AUTH_SECRET debe fijarse en .env; si falta se genera uno temporal
    # (las sesiones dejan de valer al reiniciar el servidor).
    auth_secret: str = ""
    access_token_minutes: int = 60 * 24 * 7
    cors_origins: list[str] = [
        "http://localhost:8081",
        "http://127.0.0.1:8081",
    ]

    # RAG (Explorador IA). Por defecto solo el corpus sintético de demostración.
    # Corpus: "demo" (ficticio, por defecto) o "real" (corpus/_rag, SOLO documentos habilitados en
    # rag_data/real/authorizations.json; uso local de demostración).
    rag_corpus: Literal["demo", "real"] = "demo"
    rag_index_dir: Path = Path(__file__).resolve().parents[2] / "rag_data" / "index_cache"
    rag_manifest_path: Path = Path(__file__).resolve().parents[2] / "rag_data" / "demo" / "manifest.json"
    rag_retriever: Literal["auto", "hashing", "hybrid"] = "auto"
    rag_ollama_host: str = "http://127.0.0.1:11434"
    rag_dense_model: str = "bge-m3"
    # Generación de explicaciones con un modelo local (Ollama). Mismo host que los embeddings.
    rag_generation: Literal["auto", "off"] = "auto"
    # Proveedor: "ollama" (local) o "api" (compatible con OpenAI, p. ej. Groq). La clave solo va en el servidor.
    rag_gen_provider: Literal["ollama", "api"] = "ollama"
    rag_gen_api_url: str = "https://api.groq.com/openai/v1"
    rag_gen_api_key: str = ""
    rag_gen_model: str = "llama3.2:3b"
    rag_gen_temperature: float = 0.1
    rag_gen_timeout: float = 90
    rag_gen_num_predict: int = 260
    rag_gen_num_ctx: int = 2048
    rag_gen_max_context_chars: int = 3000
    rag_top_k: int = 4
    rag_min_score: float = 0.15

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
    def ensure_auth_secret(self) -> "Settings":
        if not self.auth_secret:
            self.auth_secret = secrets.token_urlsafe(48)
        elif len(self.auth_secret) < 32:
            raise ValueError("AUTH_SECRET must have at least 32 characters")
        return self

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
