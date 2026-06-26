import { apiFetch } from "./api";

export interface ClusterStatus {
  status: "Healthy" | "Degraded";
  nodeReadiness: number;
  podHealthPercentage: number;
  failedPods: number;
  cpuPressure: boolean;
  memoryPressure: boolean;
  networkLatencyMs: number;
  packetDropPercent: number;
  timestamp: string;
}

export interface NodeTelemetry {
  name: string;
  cpuCapacity: number;
  cpuUtilization: number;
  memoryCapacity: number;
  memoryUtilization: number;
  runningPods: number;
  ip: string;
  os: string;
  kubeletVersion: string;
  role: "control-plane" | "worker";
  status: "Ready" | "NotReady";
}

export interface PodTelemetry {
  name: string;
  namespace: string;
  status: string;
  restartCount: number;
  cpuUsage: number;
  memoryUsage: number;
  node: string;
  ip: string;
}

export interface DeploymentTelemetry {
  name: string;
  namespace: string;
  replicas: number;
  desiredReplicas: number;
  availableReplicas: number;
  autoscalingState: string;
}

export interface ClusterEvent {
  type: string;
  reason: string;
  message: string;
  namespace: string;
  object: string;
  name: string;
  timestamp: string;
}

export interface CPUMetric {
  utilization: number;
  cpuUtilizationPercent: number;
  timestamp: string;
}

export interface MemoryMetric {
  utilization: number;
  memoryUtilizationPercent: number;
  timestamp: string;
}

export interface NetworkMetric {
  incomingBytesSec: number;
  outgoingBytesSec: number;
  latencyMs: number;
  packetDropPercent: number;
  timestamp: string;
}

export interface StorageMetric {
  diskUsagePercent: number;
  timestamp: string;
}

export const monitoringService = {
  getClusterStatus: () => apiFetch<ClusterStatus>("/api/cluster/status"),
  getNodes: () => apiFetch<NodeTelemetry[]>("/api/nodes"),
  getPods: () => apiFetch<PodTelemetry[]>("/api/pods"),
  getDeployments: () => apiFetch<DeploymentTelemetry[]>("/api/deployments"),
  getEvents: () => apiFetch<ClusterEvent[]>("/api/events"),
  getCPUMetrics: () => apiFetch<CPUMetric>("/api/metrics/cpu"),
  getMemoryMetrics: () => apiFetch<MemoryMetric>("/api/metrics/memory"),
  getNetworkMetrics: () => apiFetch<NetworkMetric>("/api/metrics/network"),
  getStorageMetrics: () => apiFetch<StorageMetric>("/api/metrics/storage"),
};
