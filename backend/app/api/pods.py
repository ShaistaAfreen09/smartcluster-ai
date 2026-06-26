from fastapi import APIRouter
from ..services.kubernetes_service import KubernetesService

router = APIRouter(prefix="", tags=["Pods and Deployments"])
k8s_svc = KubernetesService()

@router.get("/pods")
def get_pods():
    """
    Returns active running pods across namespaces with restarts counts.
    """
    return k8s_svc.get_pods()

@router.get("/deployments")
def get_deployments():
    """
    Returns active deployments configurations and autonomic controller states.
    """
    return k8s_svc.get_deployments()
