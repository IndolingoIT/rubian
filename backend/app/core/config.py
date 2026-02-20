from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "JurnalLingua"
    API_V1_STR: str = "/api"
    ENVIRONMENT: str = "development"

    SECRET_KEY: str = "changeme"
    CORS_ORIGINS: str = "*"

    POSTGRES_SERVER: str = "db"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "jurnallingua"
    POSTGRES_PORT: int = 5432

    REDIS_HOST: str = "redis"
    REDIS_PORT: int = 6379

    GEMINI_API_KEY: str = ""
    GEMINI_ENABLED: bool = False

    STORAGE_BACKEND: str = "local"
    LOCAL_STORAGE_PATH: str = "/app/storage"

    OPENALEX_EMAIL: str = "test@example.com"

    MAX_TOKENS_PER_JOB: int = 200000
    MAX_CHUNKS_PER_JOB: int = 200
    CREDIT_COST_PER_1K_TOKENS: int = 10

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    @property
    def CELERY_BROKER_URL(self) -> str:
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/0"

settings = Settings()
