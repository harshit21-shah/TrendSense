from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # API Keys
    GROQ_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    
    # Data Sources
    REDDIT_CLIENT_ID: Optional[str] = None
    REDDIT_CLIENT_SECRET: Optional[str] = None
    REDDIT_USER_AGENT: str = "TrendSense/0.1"
    NEWS_API_KEY: Optional[str] = None
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://user:password@db:5432/trendsense"
    
    # Vector DB
    CHROMA_HOST: str = "chromadb"
    CHROMA_PORT: int = 8000
    
    # App Config
    LOG_LEVEL: str = "INFO"
    ENVIRONMENT: str = "development"

    class Config:
        env_file = ".env"

settings = Settings()
