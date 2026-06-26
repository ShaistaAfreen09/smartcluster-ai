import datetime
from sqlalchemy import Column, Integer, Float, DateTime
from ..database import Base

class MetricsHistory(Base):
    __tablename__ = "metrics_history"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    cpu = Column(Float, nullable=False)       # aggregated CPU utilization percentage
    memory = Column(Float, nullable=False)    # aggregated RAM utilization percentage
    network = Column(Float, nullable=False)   # network traffic RPS
    storage = Column(Float, nullable=True)    # Ephemeral or disk storage block sizing percentage
