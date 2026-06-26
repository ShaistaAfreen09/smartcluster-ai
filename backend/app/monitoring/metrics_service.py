import time
from typing import Dict, List, Any
from .prometheus_client import PrometheusClient
from .kubernetes_client import KubernetesClient

class MetricsService:
    def __init__(self):
        self.prom_client = PrometheusClient()
        self.k8s_client = KubernetesClient()

    def get_dashboard_metrics(self) -> Dict[str, Any]:
        """
        Gathers real-time Prometheus + K8s API metrics, or falls back to simulated data.
        """
        # Determine if we have real integrations active
        is_real_k8s = self.k8s_client.is_connected()
        
        # 1. Fetch Cluster Health/Readiness
        nodes = self.k8s_client.get_cluster_nodes()
        pods = self.k8s_client.get_cluster_pods()
        deployments = self.k8s_client.get_deployments()
        events = self.k8s_client.get_cluster_events()

        # Fallback to simulation if Kubernetes API is not configured or unavailable
        if not is_real_k8s:
            # High-fidelity simulated data
            nodes = self._get_simulated_nodes()
            pods = self._get_simulated_pods()
            deployments = self._get_simulated_deployments()
            events = self._get_simulated_events()

        # 2. Query Prometheus Metrics
        cpu_usage_query = "sum(rate(container_cpu_usage_seconds_total[5m]))"
        mem_usage_query = "sum(container_memory_working_set_bytes)"
        
        real_cpu_usage = self.prom_client.query(cpu_usage_query)
        real_mem_usage = self.prom_client.query(mem_usage_query)

        # 3. Aggregate metrics
        cpu_val = 45.5 # Default fallback simulated usage percent
        mem_val = 52.8 # Default fallback simulated usage percent

        if real_cpu_usage and "data" in real_cpu_usage and "result" in real_cpu_usage["data"]:
            result = real_cpu_usage["data"]["result"]
            if result:
                cpu_val = float(result[0]["value"][1]) * 100.0 # Convert to percent scale depending on metrics

        if real_mem_usage and "data" in real_mem_usage and "result" in real_mem_usage["data"]:
            result = real_mem_usage["data"]["result"]
            if result:
                # Mock byte conversion to GiB representation
                mem_bytes = float(result[0]["value"][1])
                mem_val = (mem_bytes / (1024 ** 3))

        total_nodes = len(nodes)
        ready_nodes = len([n for n in nodes if n["status"] == "Ready"])
        
        total_pods = len(pods)
        running_pods = len([p for p in pods if p["status"] == "Running"])
        failed_pods = len([p for p in pods if p["status"] == "Failed"])
        
        return {
            "cluster_health": {
                "nodeReadiness": (ready_nodes / total_nodes * 100.0) if total_nodes > 0 else 100.0,
                "podHealthPercentage": (running_pods / total_pods * 100.0) if total_pods > 0 else 100.0,
                "failedPods": failed_pods,
                "cpuPressure": cpu_val > 80.0,
                "memoryPressure": mem_val > 80.0
            },
            "nodes": nodes,
            "pods": pods,
            "deployments": deployments,
            "events": events,
            "telemetry": {
                "cpuUtilization": cpu_val,
                "memoryUtilization": mem_val,
                "timestamp": time.time()
            }
        }

    def _get_simulated_nodes(self) -> List[Dict[str, Any]]:
        return [
            {
                "name": "gke-smartcluster-pool-1-control",
                "role": "control-plane",
                "status": "Ready",
                "cpuCapacity": "4",
                "memCapacity": "16Gi",
                "ip": "10.128.0.2",
                "os": "COS-109-17800.147.22",
                "kubeletVersion": "v1.28.3-gke.1053000",
                "cpuUsagePercent": 32.0,
                "memUsagePercent": 48.0
            },
            {
                "name": "gke-smartcluster-pool-1-worker-a",
                "role": "worker",
                "status": "Ready",
                "cpuCapacity": "8",
                "memCapacity": "32Gi",
                "ip": "10.128.0.10",
                "os": "COS-109-17800.147.22",
                "kubeletVersion": "v1.28.3-gke.1053000",
                "cpuUsagePercent": 64.0,
                "memUsagePercent": 58.0
            },
            {
                "name": "gke-smartcluster-pool-2-highmem-b",
                "role": "worker",
                "status": "Ready",
                "cpuCapacity": "16",
                "memCapacity": "64Gi",
                "ip": "10.128.0.11",
                "os": "Ubuntu 22.04 LTS (Optimized)",
                "kubeletVersion": "v1.28.3-gke.1053000",
                "cpuUsagePercent": 42.0,
                "memUsagePercent": 68.0
            }
        ]

    def _get_simulated_pods(self) -> List[Dict[str, Any]]:
        return [
            {"name": "api-gateway-7f55b99db9-9xrcn", "namespace": "default", "status": "Running", "restartCount": 0, "node": "gke-smartcluster-pool-1-worker-a", "ip": "10.120.1.15"},
            {"name": "api-gateway-7f55b99db9-px27t", "namespace": "default", "status": "Running", "restartCount": 2, "node": "gke-smartcluster-pool-2-highmem-b", "ip": "10.120.2.8"},
            {"name": "auth-service-58d64b4bc8-l76w4", "namespace": "default", "status": "Running", "restartCount": 0, "node": "gke-smartcluster-pool-1-worker-a", "ip": "10.120.1.22"},
            {"name": "ml-prediction-worker-84d79b9df9-qqp92", "namespace": "default", "status": "Running", "restartCount": 1, "node": "gke-smartcluster-pool-2-highmem-b", "ip": "10.120.2.44"}
        ]

    def _get_simulated_deployments(self) -> List[Dict[str, Any]]:
        return [
            {"name": "api-gateway", "namespace": "default", "replicas": 2, "desiredReplicas": 2, "availableReplicas": 2},
            {"name": "auth-service", "namespace": "default", "replicas": 1, "desiredReplicas": 1, "availableReplicas": 1},
            {"name": "ml-prediction-worker", "namespace": "default", "replicas": 1, "desiredReplicas": 1, "availableReplicas": 1}
        ]

    def _get_simulated_events(self) -> List[Dict[str, Any]]:
        return [
            {
                "type": "Warning",
                "reason": "FailedScheduling",
                "message": "0/3 nodes are available: 1 node(s) had untolerated taint, 2 Insufficient memory.",
                "namespace": "default",
                "object": "Pod",
                "name": "ml-training-heavy-worker",
                "timestamp": "2026-06-24T06:50:00Z"
            },
            {
                "type": "Normal",
                "reason": "ScalingReplicaSet",
                "message": "Scaled up replica set api-gateway-7f55b99db9 to 2 from 1",
                "namespace": "default",
                "object": "Deployment",
                "name": "api-gateway",
                "timestamp": "2026-06-24T06:45:00Z"
            }
        ]
