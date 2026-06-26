from fastapi import APIRouter
from ..services.kubernetes_service import KubernetesService

router = APIRouter(prefix="/nodes", tags=["Nodes"])
k8s_svc = KubernetesService()

@router.get("")
def get_nodes():
    """
    Consolidated live node-pools status, roles, CPU / RAM capacity metrics.
    """
    return k8s_svc.get_nodes()
