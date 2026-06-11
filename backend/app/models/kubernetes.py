from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.models.base import Base


class Cluster(Base):
    """Kubernetes cluster resource model."""
    __tablename__ = "clusters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False, index=True)
    version = Column(String, nullable=False)
    status = Column(String, default="Active")
    health_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    nodes = relationship("Node", back_populates="cluster", cascade="all, delete-orphan")
    pods = relationship("Pod", back_populates="cluster", cascade="all, delete-orphan")
    deployments = relationship("Deployment", back_populates="cluster", cascade="all, delete-orphan")


class Node(Base):
    """Kubernetes node resource model."""
    __tablename__ = "nodes"

    id = Column(Integer, primary_key=True, index=True)
    cluster_id = Column(Integer, ForeignKey("clusters.id"), nullable=False, index=True)
    name = Column(String, nullable=False, index=True)
    status = Column(String, default="Ready")  # Ready, NotReady
    cpu_capacity = Column(Float, nullable=False)
    memory_capacity = Column(Float, nullable=False)
    cpu_used = Column(Float, default=0.0)
    memory_used = Column(Float, default=0.0)
    pod_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    cluster = relationship("Cluster", back_populates="nodes")
    pods = relationship("Pod", back_populates="node", cascade="all, delete-orphan")


class Pod(Base):
    """Kubernetes pod resource model."""
    __tablename__ = "pods"

    id = Column(Integer, primary_key=True, index=True)
    cluster_id = Column(Integer, ForeignKey("clusters.id"), nullable=False, index=True)
    node_id = Column(Integer, ForeignKey("nodes.id"), nullable=True)
    name = Column(String, nullable=False, index=True)
    namespace = Column(String, nullable=False, index=True)
    status = Column(String, default="Pending")  # Running, Pending, Failed, CrashLoopBackOff
    cpu_request = Column(Float, default=0.0)
    memory_request = Column(Float, default=0.0)
    cpu_usage = Column(Float, default=0.0)
    memory_usage = Column(Float, default=0.0)
    restart_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    cluster = relationship("Cluster", back_populates="pods")
    node = relationship("Node", back_populates="pods")


class Deployment(Base):
    """Kubernetes deployment resource model."""
    __tablename__ = "deployments"

    id = Column(Integer, primary_key=True, index=True)
    cluster_id = Column(Integer, ForeignKey("clusters.id"), nullable=False, index=True)
    name = Column(String, nullable=False, index=True)
    namespace = Column(String, nullable=False)
    replicas_desired = Column(Integer, default=1)
    replicas_ready = Column(Integer, default=0)
    replicas_updated = Column(Integer, default=0)
    replicas_available = Column(Integer, default=0)
    status = Column(String, default="Progressing")  # Progressing, Complete, Failed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    cluster = relationship("Cluster", back_populates="deployments")


class Metric(Base):
    """Time-series metric data for forecasting."""
    __tablename__ = "metrics"

    id = Column(Integer, primary_key=True, index=True)
    resource_type = Column(String, nullable=False)  # cluster, node, pod
    resource_id = Column(String, nullable=False, index=True)
    metric_name = Column(String, nullable=False)  # cpu, memory, network_in, network_out
    value = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)


class Recommendation(Base):
    """AI-driven recommendations."""
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    cluster_id = Column(Integer, ForeignKey("clusters.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    category = Column(String, nullable=False)  # cost, performance, reliability
    priority = Column(String, default="medium")  # low, medium, high, critical
    status = Column(String, default="new")  # new, acknowledged, resolved
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Anomaly(Base):
    """Detected anomalies from ML models."""
    __tablename__ = "anomalies"

    id = Column(Integer, primary_key=True, index=True)
    cluster_id = Column(Integer, ForeignKey("clusters.id"), nullable=False, index=True)
    resource_type = Column(String, nullable=False)  # cluster, node, pod, deployment
    resource_id = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    severity = Column(String, default="medium")  # low, medium, high, critical
    status = Column(String, default="active")  # active, acknowledged, resolved
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
