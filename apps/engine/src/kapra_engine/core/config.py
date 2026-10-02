"""12-factor configuration. Env-driven, no secrets in code."""

from __future__ import annotations

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="KAPRA_",
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    env: str = Field(default="development")
    log_level: str = Field(default="INFO")

    # CORS — the web app origin(s) allowed to call the engine.
    cors_origins: list[str] = Field(default=["http://localhost:3000"])

    # Persistence. SQLite for dev; the repo layer stays swappable to
    # Postgres/pgvector for V2 by changing only this URL + one adapter.
    database_url: str = Field(default="sqlite:///./kapra.sqlite3")

    # Reasoning (INFERRED layer) — local Ollama, off by default in Phase 0.
    ollama_enabled: bool = Field(default=False)
    ollama_url: str = Field(default="http://localhost:11434")
    ollama_model: str = Field(default="qwen2.5:7b")


@lru_cache
def get_settings() -> Settings:
    return Settings()
