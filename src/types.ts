export interface NodeSimulator {
  name: string;
  role: "control-plane" | "worker";
  status: "Ready" | "NotReady";
  cpuCapacity: number;
  memCapacity: number;
  cpuAllocated: number;
  memAllocated: number;
  cpuUsagePercent: number;
  memUsagePercent: number;
  ip: string;
  os: string;
  kubeletVersion: string;
}

export interface DeploymentSimulator {
  name: string;
  namespace: string;
  replicas: number;
  targetReplicas: number;
  availableReplicas: number;
  labels: Record<string, string>;
  strategy: string;
}

export interface PodSimulator {
  id: string;
  name: string;
  namespace: string;
  deployment: string;
  node: string;
  status: string;
  cpuRequest: number;
  cpuLimit: number;
  cpuUsage: number;
  memRequest: number;
  memLimit: number;
  memUsage: number;
  restarts: number;
  age: string;
}

export interface TelemetryPoint {
  timestamp: string;
  cpuUsedCores: number;
  cpuCapacityCores: number;
  cpuRequestedCores: number;
  memUsedGi: number;
  memCapacityGi: number;
  memRequestedGi: number;
  trafficRPS: number;
  activePodsCount: number;
}

export interface PredictorData {
  metricsHistory: TelemetryPoint[];
  predictions: {
    hourOffset: number;
    timestamp: string;
    predictedCpuLinear: number;
    predictedMemLinear: number;
    predictedCpuEnsemble: number;
    predictedMemEnsemble: number;
    predictedTrafficRPS: number;
    confidenceIntervalCpu: [number, number];
    confidenceIntervalMem: [number, number];
  }[];
  regressionAnalysis: {
    cpu: {
      regressionFormula: string;
      slopeCoefficientCoresPerHour: number;
      rSquareScore: number;
      trendDirection: string;
    };
    memory: {
      regressionFormula: string;
      slopeCoefficientGiPerHour: number;
      rSquareScore: number;
      trendDirection: string;
    };
  };
}

export interface ScalingSimPoint {
  hour: string;
  workloadRPS: number;
  hpaReplicas: number;
  aiReplicas: number;
  hpaLatencyMs: number;
  aiLatencyMs: number;
  hpaWasteCores: number;
  aiWasteCores: number;
}

export interface ScalingSimResponse {
  data: ScalingSimPoint[];
  metricsSummary: {
    averageLatencyReductionPercent: number;
    totalHpaCoreWasteHours: number;
    totalAiCoreWasteHours: number;
    costSavingsPercent: number;
    hpaPerformanceSpikesCount: number;
    aiPerformanceSpikesCount: number;
  };
}

export interface ClusterStatus {
  nodes: NodeSimulator[];
  deployments: DeploymentSimulator[];
  namespaces: string[];
  pods: PodSimulator[];
  activeWorkloadType: "Standard" | "Spike" | "Underloaded" | "Periodic";
  summary: {
    totalNodes: number;
    totalPods: number;
    totalCpuCapacity: number;
    totalMemCapacity: number;
    currentCpuAllocated: number;
    currentMemAllocated: number;
    currentTrafficRPS: number;
  };
}
