from pathlib import Path
from pydantic_settings import BaseSettings

# Root directory
BASE_DIR = Path(__file__).parent.parent.parent


class Settings(BaseSettings):
    """Application settings and configuration."""

    # Environment
    ENV: str = "development"
    DEBUG: bool = False

    # API
    PROJECT_NAME: str = "SmartCluster AI"
    PROJECT_VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"

    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/smartcluster"
    SQLALCHEMY_ECHO: bool = False

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_DIR: Path = BASE_DIR / "logs"

    class Config:
        env_file = BASE_DIR.parent / ".env"
        case_sensitive = True


settings = Settings()
