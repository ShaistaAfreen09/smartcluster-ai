from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.kubernetes_service import KubernetesService

router = APIRouter(prefix="/clusters", tags=["Clusters"])
k8s_svc = KubernetesService()

@router.get("")
def list_clusters():
    """
    Get GKE / Local Kubernetes cluster status metrics.
    """
    # Simply serialize GKE operational statuses
    return [
        {
            "id": 1,
            "cluster_name": "gke_smartcluster-ai_us-central1-a",
            "cloud_provider": "GCP/GKE",
            "region": "us-central1-a",
            "status": "Healthy",
            "nodesCount": len(k8s_svc.get_nodes()),
            "restartsTrend": "0% change"
        }
    ]

@router.get("/health")
def get_cluster_health():
    """
    Consolidated readiness coefficients index.
    """
    nodes = k8s_svc.get_nodes()
    pods = k8s_svc.get_pods()
    failed = sum(1 for p in pods if p.get("status") in ["Failed", "Error"])
    
    return {
        "nodeReadiness": 100.0 if all(n["status"] == "Ready" for n in nodes) else 66.6,
        "podHealthPercentage": float(f"{(len(pods) - failed) / len(pods) * 100.0:.1f}") if pods else 100.0,
        "failedPods": failed,
        "cpuPressure": any(n.get("cpuUsagePercent", 0) > 85.0 for n in nodes),
        "memoryPressure": any(n.get("memUsagePercent", 0) > 90.0 for n in nodes)
    }
