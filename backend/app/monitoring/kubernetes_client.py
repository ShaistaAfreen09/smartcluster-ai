import os
from typing import List, Dict, Any, Optional

try:
    from kubernetes import client, config
    K8S_AVAILABLE = True
except ImportError:
    K8S_AVAILABLE = False

class KubernetesClient:
    def __init__(self):
        self.core_api = None
        self.apps_api = None
        self.custom_api = None
        
        if K8S_AVAILABLE:
            try:
                # Try in-cluster config first
                config.load_incluster_config()
                self.core_api = client.CoreV1Api()
                self.apps_api = client.AppsV1Api()
                self.custom_api = client.CustomObjectsApi()
                print("Python K8s Client: Loaded in-cluster configuration.")
            except Exception as e_incluster:
                try:
                    # Try local kubeconfig
                    config.load_kube_config()
                    self.core_api = client.CoreV1Api()
                    self.apps_api = client.AppsV1Api()
                    self.custom_api = client.CustomObjectsApi()
                    print("Python K8s Client: Loaded local kubeconfig configuration.")
                except Exception as e_local:
                    print(f"Python K8s Client: Kubernetes SDK is unavailable or lacks configuration. In-cluster: {e_incluster}, Local: {e_local}")

    def is_connected(self) -> bool:
        return self.core_api is not None

    def get_cluster_nodes(self) -> List[Dict[str, Any]]:
        """
        Fetch node capacities, conditions, operating system, IP addresses, etc.
        """
        if not self.core_api:
            return []
        try:
            nodes_info = []
            node_list = self.core_api.list_node()
            for node in node_list.items:
                name = node.metadata.name
                conditions = node.status.conditions or []
                status = "Ready" if any(c.type == "Ready" and c.status == "True" for c in conditions) else "NotReady"
                
                cpu_capacity = node.status.capacity.get("cpu", "0")
                mem_capacity = node.status.capacity.get("memory", "0")
                
                addresses = node.status.addresses or []
                ip = next((addr.address for addr in addresses if addr.type == "InternalIP"), "Unknown")
                
                node_info = node.status.node_info
                os = node_info.os_image if node_info else "Unknown"
                kubelet_version = node_info.kubelet_version if node_info else "Unknown"
                
                nodes_info.append({
                    "name": name,
                    "status": status,
                    "cpuCapacity": cpu_capacity,
                    "memCapacity": mem_capacity,
                    "ip": ip,
                    "os": os,
                    "kubeletVersion": kubelet_version
                })
            return nodes_info
        except Exception as e:
            print(f"Error listing cluster nodes: {e}")
            return []

    def get_cluster_pods(self, namespace: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Fetch pod information including restarts, namespace, cpu usage, and statuses.
        """
        if not self.core_api:
            return []
        try:
            pods_info = []
            if namespace:
                pod_list = self.core_api.list_namespaced_pod(namespace=namespace)
            else:
                pod_list = self.core_api.list_pod_for_all_namespaces()
                
            for pod in pod_list.items:
                name = pod.metadata.name
                ns = pod.metadata.namespace
                status = pod.status.phase
                
                # Calculate restarts
                restarts = 0
                container_statuses = pod.status.container_statuses or []
                for cs in container_statuses:
                    restarts += cs.restart_count
                    
                pods_info.append({
                    "name": name,
                    "namespace": ns,
                    "status": status,
                    "restartCount": restarts,
                    "node": pod.spec.node_name or "Unassigned",
                    "ip": pod.status.pod_ip or "Unknown"
                })
            return pods_info
        except Exception as e:
            print(f"Error listing cluster pods: {e}")
            return []

    def get_deployments(self, namespace: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Fetch deployment health, available replicas, desired replicas.
        """
        if not self.apps_api:
            return []
        try:
            deployments_info = []
            if namespace:
                dep_list = self.apps_api.list_namespaced_deployment(namespace=namespace)
            else:
                dep_list = self.apps_api.list_deployment_for_all_namespaces()
                
            for dep in dep_list.items:
                name = dep.metadata.name
                ns = dep.metadata.namespace
                replicas = dep.status.replicas or 0
                available_replicas = dep.status.available_replicas or 0
                desired_replicas = dep.spec.replicas or 0
                
                deployments_info.append({
                    "name": name,
                    "namespace": ns,
                    "replicas": replicas,
                    "desiredReplicas": desired_replicas,
                    "availableReplicas": available_replicas
                })
            return deployments_info
        except Exception as e:
            print(f"Error listing deployments: {e}")
            return []

    def get_cluster_events(self) -> List[Dict[str, Any]]:
        """
        List active Kubernetes events/warnings.
        """
        if not self.core_api:
            return []
        try:
            events_info = []
            event_list = self.core_api.list_event_for_all_namespaces(limit=50)
            # Sort events by last timestamp
            sorted_events = sorted(
                event_list.items,
                key=lambda x: x.last_timestamp or x.event_time or "",
                reverse=True
            )
            for ev in sorted_events[:20]:
                events_info.append({
                    "type": ev.type,
                    "reason": ev.reason,
                    "message": ev.message,
                    "namespace": ev.metadata.namespace,
                    "object": ev.involved_object.kind if ev.involved_object else "Unknown",
                    "name": ev.involved_object.name if ev.involved_object else "Unknown",
                    "timestamp": (ev.last_timestamp or ev.event_time or "").isoformat() if hasattr(ev.last_timestamp, "isoformat") else str(ev.last_timestamp)
                })
            return events_info
        except Exception as e:
            print(f"Error listing cluster events: {e}")
            return []
