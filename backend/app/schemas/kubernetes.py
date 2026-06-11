from datetime import datetime
from pydantic import BaseModel, Field
from typing import List, Optional


# Cluster Schemas
class ClusterBase(BaseModel):
    name: str
    version: str
    status: str = "Active"
    health_score: float = 0.0


class ClusterCreate(ClusterBase):
    pass


class ClusterRead(ClusterBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Node Schemas
class NodeBase(BaseModel):
    name: str
    status: str = "Ready"
    cpu_capacity: float
    memory_capacity: float
    cpu_used: float = 0.0
    memory_used: float = 0.0


class NodeCreate(NodeBase):
    cluster_id: int


class NodeRead(NodeBase):
    id: int
    cluster_id: int
    pod_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Pod Schemas
class PodBase(BaseModel):
    name: str
    namespace: str
    status: str = "Pending"
    cpu_request: float = 0.0
    memory_request: float = 0.0
    cpu_usage: float = 0.0
    memory_usage: float = 0.0


class PodCreate(PodBase):
    cluster_id: int
    node_id: Optional[int] = None


class PodRead(PodBase):
    id: int
    cluster_id: int
    node_id: Optional[int]
    restart_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Deployment Schemas
class DeploymentBase(BaseModel):
    name: str
    namespace: str
    replicas_desired: int = 1
    replicas_ready: int = 0
    replicas_updated: int = 0
    replicas_available: int = 0
    status: str = "Progressing"


class DeploymentCreate(DeploymentBase):
    cluster_id: int


class DeploymentRead(DeploymentBase):
    id: int
    cluster_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Metric Schemas
class MetricBase(BaseModel):
    resource_type: str
    resource_id: str
    metric_name: str
    value: float


class MetricCreate(MetricBase):
    pass


class MetricRead(MetricBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True


# Recommendation Schemas
class RecommendationBase(BaseModel):
    title: str
    description: str
    category: str
    priority: str = "medium"
    status: str = "new"


class RecommendationCreate(RecommendationBase):
    cluster_id: int


class RecommendationRead(RecommendationBase):
    id: int
    cluster_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Anomaly Schemas
class AnomalyBase(BaseModel):
    resource_type: str
    resource_id: str
    title: str
    description: str
    severity: str = "medium"
    status: str = "active"


class AnomalyCreate(AnomalyBase):
    cluster_id: int


class AnomalyRead(AnomalyBase):
    id: int
    cluster_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Health Check Schema
class HealthResponse(BaseModel):
    status: str
    db: bool
    timestamp: datetime = Field(default_factory=datetime.utcnow)
