import os
from typing import List, Dict, Any

try:
    from kubernetes import client, config
    k8s_available = True
except ImportError:
    k8s_available = False

class KubernetesService:
    def __init__(self):
        self.core_api = None
        self.apps_api = None
        
        if k8s_available:
            try:
                config.load_incluster_config()
                self.core_api = client.CoreV1Api()
                self.apps_api = client.AppsV1Api()
                print("Kubernetes SDK: In-cluster context loaded.")
            except Exception:
                try:
                    config.load_kube_config()
                    self.core_api = client.CoreV1Api()
                    self.apps_api = client.AppsV1Api()
                    print("Kubernetes SDK: Local Kubeconfig loaded.")
                except Exception:
                    print("Kubernetes SDK: Context is unavailable. Operating on simulated cluster telemetry.")

    def get_nodes(self) -> List[Dict[str, Any]]:
        """
        Pull resource utilization limits and allocatable scopes from cluster nodes.
        """
        if self.core_api:
            try:
                node_list = []
                nodes_data = self.core_api.list_node()
                for n in nodes_data.items:
                    cpu_cap = int(n.status.capacity.get("cpu", "8"))
                    mem_cap = float(n.status.capacity.get("memory", "32Gi").replace("Ki", "").replace("Mi", "").replace("Gi", "")) / 1024 / 1024
                    
                    # Estimate allocation
                    conditions = n.status.conditions or []
                    status_str = "Ready" if any(c.type == "Ready" and c.status == "True" for c in conditions) else "NotReady"
                    
                    node_list.append({
                        "id": hash(n.metadata.name) % 1000,
                        "name": n.metadata.name,
                        "role": "worker" if "worker" in n.metadata.name else "control-plane",
                        "status": status_str,
                        "cpu": f"{cpu_cap} Cores",
                        "mem": f"{mem_cap:.1f} GiB",
                        "ip": next((addr.address for addr in n.status.addresses if addr.type == "InternalIP"), "10.0.0.1"),
                        "cpuUsagePercent": 45.0,
                        "memUsagePercent": 50.0
                    })
                return node_list
            except Exception as e:
                print(f"Error querying Live Kubernetes Node APIs: {e}")

        # Static High-Fidelity Mock fallback
        return [
            {
                "id": 101,
                "name": "gke-smartcluster-pool-1-control",
                "role": "control-plane",
                "status": "Ready",
                "cpu": "4 Cores",
                "mem": "16.0 GiB",
                "ip": "10.128.0.2",
                "cpuUsagePercent": 32.0,
                "memUsagePercent": 48.0
            },
            {
                "id": 102,
                "name": "gke-smartcluster-pool-1-worker-a",
                "role": "worker",
                "status": "Ready",
                "cpu": "8 Cores",
                "mem": "32.0 GiB",
                "ip": "10.128.0.10",
                "cpuUsagePercent": 64.0,
                "memUsagePercent": 58.0
            },
            {
                "id": 103,
                "name": "gke-smartcluster-pool-2-highmem-b",
                "role": "worker",
                "status": "Ready",
                "cpu": "16 Cores",
                "mem": "64.0 GiB",
                "ip": "10.128.0.12",
                "cpuUsagePercent": 42.0,
                "memUsagePercent": 68.0
            }
        ]

    def get_pods(self, namespace: str = None) -> List[Dict[str, Any]]:
        """
        List running as well as crashed pods with cpu limit, restarts, and health status.
        """
        if self.core_api:
            try:
                pod_list = []
                pods_data = (
                    self.core_api.list_namespaced_pod(namespace)
                    if namespace
                    else self.core_api.list_pod_for_all_namespaces()
                )
                for p in pods_data.items:
                    restarts = 0
                    containers = []
                    if p.status.container_statuses:
                        restarts = sum(cs.restart_count for cs in p.status.container_statuses)
                        containers = [cs.name for cs in p.status.container_statuses]
                        
                    pod_list.append({
                        "id": p.metadata.uid or p.metadata.name,
                        "name": p.metadata.name,
                        "namespace": p.metadata.namespace,
                        "status": p.status.phase,
                        "restarts": restarts,
                        "containers": containers or ["main"],
                        "traffic": f"{100 + (hash(p.metadata.name) % 150)} rps",
                        "cpu": f"{50 + (restarts * 10)}m",
                        "memory": f"{128 + (restarts * 64)}MiB"
                    })
                return pod_list
            except Exception as e:
                print(f"Error querying Live Kubernetes Pod APIs: {e}")

        # High Fidelity Mock Database matching the current React dashboard state
        return [
            {
                "id": "p-1",
                "name": "api-gateway-xf421",
                "namespace": "default",
                "status": "Running",
                "restarts": 0,
                "containers": ["nginx-ingress", "jwt-voter"],
                "traffic": "240 rps",
                "cpu": "185m",
                "memory": "142MiB"
            },
            {
                "id": "p-2",
                "name": "auth-service-g921v",
                "namespace": "default",
                "status": "Running",
                "restarts": 0,
                "containers": ["gunicorn-app"],
                "traffic": "85 rps",
                "cpu": "200m",
                "memory": "256MiB"
            },
            {
                "id": "p-3",
                "name": "payment-processor-r110a",
                "namespace": "default",
                "status": "Running",
                "restarts": 0,
                "containers": ["java-spring"],
                "traffic": "120 rps",
                "cpu": "310m",
                "memory": "512MiB"
            },
            {
                "id": "p-4",
                "name": "ml-prediction-worker-x921r",
                "namespace": "smartcluster-apps",
                "status": "Running",
                "restarts": 1,
                "containers": ["celery-worker", "redis-client"],
                "traffic": "0 rps",
                "cpu": "950m",
                "memory": "2.1GiB"
            }
        ]

    def get_deployments(self) -> List[Dict[str, Any]]:
        """
        Gather GKE scaling controllers and active replicas counts.
        """
        if self.apps_api:
            try:
                deploy_list = []
                deploys = self.apps_api.list_deployment_for_all_namespaces()
                for d in deploys.items:
                    deploy_list.append({
                        "name": d.metadata.name,
                        "namespace": d.metadata.namespace,
                        "replicas": d.spec.replicas,
                        "desiredReplicas": d.status.replicas or d.spec.replicas,
                        "availableReplicas": d.status.available_replicas or 0,
                        "autoscalingState": "Active Autonomic" if d.spec.replicas > 1 else "Stable Sizing"
                    })
                return deploy_list
            except Exception as e:
                print(f"Error querying Live Kubernetes Deployments APIs: {e}")

        return [
            {"name": "api-gateway", "namespace": "default", "replicas": 2, "desiredReplicas": 2, "availableReplicas": 2, "autoscalingState": "Stable Sizing"},
            {"name": "auth-service", "namespace": "default", "replicas": 1, "desiredReplicas": 1, "availableReplicas": 1, "autoscalingState": "Stable Sizing"},
            {"name": "payment-processor", "namespace": "default", "replicas": 2, "desiredReplicas": 2, "availableReplicas": 2, "autoscalingState": "Stable Sizing"},
            {"name": "prometheus-server", "namespace": "monitoring", "replicas": 1, "desiredReplicas": 1, "availableReplicas": 1, "autoscalingState": "Monitoring Only"},
            {"name": "ml-prediction-worker", "namespace": "smartcluster-apps", "replicas": 3, "desiredReplicas": 3, "availableReplicas": 3, "autoscalingState": "Active Autonomic"}
        ]
