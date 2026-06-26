import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, Boolean
from ..database.connection import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_login = Column(DateTime, default=datetime.datetime.utcnow)

class ClusterHistory(Base):
    __tablename__ = "cluster_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    cpu_usage = Column(Float, nullable=False)      # cores
    memory_usage = Column(Float, nullable=False)   # Gi
    network_usage = Column(Float, nullable=False)  # RPS / throughput MBs
    active_pods = Column(Integer, nullable=False)

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, index=True)
    predicted_cpu = Column(Float, nullable=False)
    predicted_memory = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String, primary_key=True, index=True)
    message = Column(String, nullable=False)
    severity = Column(String, nullable=False)      # INFO, WARNING, CRITICAL
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
