from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "DelphiMinds ML Service"
    app_version: str = "1.0.0"
    log_level: str = "INFO"
    max_file_size_mb: int = Field(default=10, ge=1, le=50)
    embedding_model_name: str = "sentence-transformers/all-MiniLM-L6-v2"
    allowed_extensions: tuple[str, ...] = (".pdf", ".docx")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
