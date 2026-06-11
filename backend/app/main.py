from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import health
from app.core import logger as logging_setup
from app.core.config import settings
from app.services.db import engine
from app.models.base import Base

# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    debug=settings.DEBUG,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix=settings.API_V1_STR, tags=["health"])


@app.on_event("startup")
def on_startup():
    """Initialize application on startup."""
    logging_setup.configure_logging()
    logger = logging_setup.logger
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.PROJECT_VERSION}")
    
    # Create database tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized")


@app.on_event("shutdown")
def on_shutdown():
    """Clean up on shutdown."""
    logger = logging_setup.logger
    logger.info("Shutting down application")


@app.get("/")
def root():
    """Root endpoint."""
    return {
        "message": f"{settings.PROJECT_NAME}",
        "version": settings.PROJECT_VERSION,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )

