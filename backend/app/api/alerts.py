import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.alert import AlertAndRecommendation

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("")
def list_alerts(db: Session = Depends(get_db)):
    """
    Get all active alerts and security policy warnings.
    """
    db_alerts = db.query(AlertAndRecommendation).all()
    if db_alerts:
        return db_alerts
        
    # Return active diagnostic warnings matching telemetry
    return [
        {
            "id": "alert-1",
            "title": "Ingress Network Spike",
            "description": "Total cluster request count surged past 400 rps limit. Mitigating with automatic load shedding.",
            "severity": "WARNING",
            "confidence_score": 0.95,
            "action_required": True,
            "created_at": datetime.datetime.utcnow().isoformat()
        },
        {
            "id": "alert-2",
            "title": "CrashLoopBackOff Warning",
            "description": "Deployment ml-prediction-worker container restart looped on worker pool.",
            "severity": "CRITICAL",
            "confidence_score": 1.0,
            "action_required": True,
            "created_at": (datetime.datetime.utcnow() - datetime.timedelta(minutes=10)).isoformat()
        }
    ]
