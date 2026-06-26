import datetime
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from ..database import Base

class Cluster(Base):
    __tablename__ = "clusters"

    id = Column(Integer, primary_key=True, index=True)
    cluster_name = Column(String(255), unique=True, index=True, nullable=False)
    cloud_provider = Column(String(100), nullable=True) # e.g. GKE, EKS, AKS, minikube
    region = Column(String(100), nullable=True)
    status = Column(String(50), default="Healthy")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    nodes = relationship("Node", back_populates="cluster", cascade="all, delete-orphan")
