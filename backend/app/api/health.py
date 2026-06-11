from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.services.db import get_db
from app.schemas.kubernetes import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["health"])
def health_check(db: Session = Depends(get_db)):
    """Check application and database health."""
    db_healthy = True
    try:
        # Simple database connectivity check
        db.execute(text("SELECT 1"))
    except SQLAlchemyError:
        db_healthy = False

    status = "ok" if db_healthy else "degraded"
    return HealthResponse(
        status=status,
        db=db_healthy,
        timestamp=datetime.utcnow(),
    )

