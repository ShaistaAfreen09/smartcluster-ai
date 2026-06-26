import os

class Settings:
    PROJECT_NAME: str = "SmartCluster AI"
    API_V1_STR: str = "/api"
    
    # Auth config
    AUTH_MODE: str = os.getenv("AUTH_MODE", "google")
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-smartcluster-access-key")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    APP_URL:"https://aistudio.google.com/apps/d16b2bdf-d79c-4431-87bf-29468f023927"
    
    # Environment mode settings
    KUBERNETES_MODE: str = os.getenv("KUBERNETES_MODE", "local")
    CLUSTER_PROVIDER: str = os.getenv("CLUSTER_PROVIDER", "gke")
    
    # DB config
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./smartcluster.db")
    
    # Services config
    PROMETHEUS_URL: str = os.getenv("PROMETHEUS_URL", "http://prometheus-server.monitoring.svc.cluster.local:9090")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

settings = Settings()
