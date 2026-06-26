import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from ..database import Base

class AlertAndRecommendation(Base):
    __tablename__ = "alerts_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(String(1000), nullable=False)
    confidence_score = Column(Float, default=1.0)
    severity = Column(String(50), default="INFO")  # INFO, WARNING, HIGH, CRITICAL
    action_required = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
