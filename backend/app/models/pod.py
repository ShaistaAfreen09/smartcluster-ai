from sqlalchemy import Column, Integer, String, Float
from ..database import Base

class Pod(Base):
    __tablename__ = "pods"

    id = Column(Integer, primary_key=True, index=True)
    pod_name = Column(String(255), unique=True, index=True, nullable=True)
    namespace = Column(String(100), index=True, nullable=False, default="default")
    deployment_name = Column(String(255), index=True, nullable=False)
    cpu_usage = Column(Float, default=0.0)      # Millicores
    memory_usage = Column(Float, default=0.0)   # MiB
    replicas = Column(Integer, default=1)
    health_status = Column(String(50), default="Running")
