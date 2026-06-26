from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class ClusterHealthSchema(BaseModel):
    nodeReadiness: float
    podHealthPercentage: float
    failedPods: int
    cpuPressure: bool
    memoryPressure: bool

class TelemetryDataSchema(BaseModel):
    cpuUtilization: float
    memoryUtilization: float
    timestamp: float

class NodeSchema(BaseModel):
    name: str
    status: str
    cpuCapacity: str
    memCapacity: str
    ip: str
    os: str
    kubeletVersion: str
    cpuUsagePercent: float
    memUsagePercent: float

class PodSchema(BaseModel):
    name: str
    namespace: str
    status: str
    restartCount: int
    node: str
    ip: str

class DeploymentSchema(BaseModel):
    name: str
    namespace: str
    replicas: int
    desiredReplicas: int
    availableReplicas: int

class EventSchema(BaseModel):
    type: str
    reason: str
    message: str
    namespace: str
    object: str
    name: str
    timestamp: str

class DashboardDataSchema(BaseModel):
    cluster_health: ClusterHealthSchema
    nodes: List[NodeSchema]
    pods: List[PodSchema]
    deployments: List[DeploymentSchema]
    events: List[EventSchema]
    telemetry: TelemetryDataSchema
