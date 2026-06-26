from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class Node(Base):
    __tablename__ = "nodes"

    id = Column(Integer, primary_key=True, index=True)
    cluster_id = Column(Integer, ForeignKey("clusters.id"), nullable=False)
    hostname = Column(String(255), unique=True, index=True, nullable=False)
    cpu_capacity = Column(Integer, nullable=False)  # Cores
    memory_capacity = Column(Float, nullable=False)  # GB
    status = Column(String(50), default="Ready")

    # Relationships
    cluster = relationship("Cluster", back_populates="nodes")
