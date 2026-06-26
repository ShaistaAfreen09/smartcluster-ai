from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# Token/Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    email: Optional[str] = None
    exp: Optional[int] = None

class UserBase(BaseModel):
    email: EmailStr
    name: str
    avatar_url: Optional[str] = None
    provider: str = "google"

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Cluster Schemas
class ClusterBase(BaseModel):
    cluster_name: str
    cloud_provider: str
    region: str
    status: str = "Healthy"

class ClusterCreate(ClusterBase):
    pass

class ClusterResponse(ClusterBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Node Schemas
class NodeResponse(BaseModel):
    id: int
    cluster_id: int
    hostname: str
    cpu_capacity: int
    memory_capacity: float
    status: str

    class Config:
        from_attributes = True

# Pod Schemas
class PodResponse(BaseModel):
    id: int
    namespace: str
    deployment_name: str
    cpu_usage: float
    memory_usage: float
    replicas: int
    health_status: str

    class Config:
        from_attributes = True

# Metrics History Schemas
class MetricsHistoryResponse(BaseModel):
    timestamp: datetime
    cpu: float
    memory: float
    network: float
    storage: Optional[float] = None

    class Config:
        from_attributes = True

# AI Analysis and Prediction Schemas
class AIAnalysisRequest(BaseModel):
    cpu_history: List[float] = Field(..., description="List of recent CPU readings")
    memory_history: List[float] = Field(..., description="List of recent Memory readings")
    pod_failures: int = Field(0, description="Count of recent pod failures")
    scaling_history: List[str] = Field(default_factory=list, description="Recent scaling event history logs")

class AIAnalysisResponse(BaseModel):
    risk: str = Field(..., description="Calculated saturation risk assessment: LOW, MEDIUM, HIGH")
    prediction: str = Field(..., description="Projections of performance and bottlenecks")
    recommendation: str = Field(..., description="Actionable recommended mitigation playbook")
    confidence: float = Field(..., description="AI confidence coefficient between 0.0 and 1.0")

class PredictionRequest(BaseModel):
    metrics: List[Dict[str, Any]] = Field(..., description="Time series historical telemetry points to train model")
    steps_ahead: int = Field(6, description="Hours / interval offsets to forecast in the future")

class PredictionResponse(BaseModel):
    predictedCpuLoad: float
    expectedMemoryConsumption: float
    expectedTrafficSpike: int
    confidenceScore: float
    estimatedTimeUntilSaturation: int
    predictions: List[Dict[str, Any]]
    regressionAnalysis: Dict[str, Any]
