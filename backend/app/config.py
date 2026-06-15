from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    # API Keys
    GROQ_API_KEY: Optional[str] = None
    GROQ_MODEL: str = "llama-3.1-8b-instant"
    NEWS_API_KEY: Optional[str] = None
    # Reddit OAuth2 (optional) — register at https://www.reddit.com/prefs/apps
    # Type: "script" app. Gives 100 req/min vs the default ~1 req/min unauthenticated.
    REDDIT_CLIENT_ID: Optional[str] = None
    REDDIT_CLIENT_SECRET: Optional[str] = None

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///trendsense.db"

    # Vector DB
    CHROMA_HOST: str = ""
    CHROMA_PORT: int = 8000

    # App Config
    LOG_LEVEL: str = "INFO"
    ENVIRONMENT: str = "development"

    # Pipeline
    PIPELINE_DOMAINS: str = "AI,Fintech,Health,Biotech,Climate,Crypto"
    PIPELINE_SCHEDULE_MINUTES: int = 720  # 12 hours
    PIPELINE_API_KEY: Optional[str] = None

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # Notifications
    NOTIFICATION_TVS_DELTA_THRESHOLD: float = 5.0

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def pipeline_domains_list(self) -> List[str]:
        return [d.strip() for d in self.PIPELINE_DOMAINS.split(",") if d.strip()]


settings = Settings()
