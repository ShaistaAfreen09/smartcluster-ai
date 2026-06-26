from fastapi import APIRouter
from ..services.prometheus_service import PrometheusService

router = APIRouter(prefix="/metrics", tags=["Metrics"])
prom_svc = PrometheusService()

@router.get("")
def get_historical_telemetry():
    """
    Returns 24 hours trend history points suited for graphing dashboards.
    """
    return prom_svc.get_historical_metrics()

@router.get("/cpu")
def get_cpu_scrape():
    """
    Returns live aggregated CPU utilization per instance node.
    """
    return prom_svc.get_cpu_utilization()

@router.get("/memory")
def get_mem_scrape():
    """
    Returns live aggregated Memory allocation per instance node.
    """
    return prom_svc.get_memory_utilization()

@router.get("/latency")
def get_latency_ms():
    """
    Returns path requests latencies.
    """
    return prom_svc.get_latency_ms()
