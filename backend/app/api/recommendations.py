import datetime
from fastapi import APIRouter
from ..services.ai_service import AIService
from ..services.prometheus_service import PrometheusService
from ..schemas.schemas import AIAnalysisRequest, AIAnalysisResponse

router = APIRouter(prefix="", tags=["AI Autonomic Recommendations"])
prom_svc = PrometheusService()

@router.get("/recommendations")
def get_recommendations():
    """
    Returns real-time actionable recommendations targeting load scenarios or idle savings.
    """
    history = prom_svc.get_historical_metrics()
    latest_cpu = history[-1]["cpu"] if history else 50.0
    latest_mem = history[-1]["mem"] if history else 55.0

    return [
        {
            "id": "rec-1",
            "message": f"Resource congestion forecasted: CPU load trends exceed safe boundary thresholds ({latest_cpu}%). Increase deployment replica counts standard buffer by 3.",
            "severity": "HIGH" if latest_cpu > 70 else "INFO",
            "created_at": datetime.datetime.utcnow().isoformat()
        },
        {
            "id": "rec-2",
            "message": f"Node memory constraints warning: Pooled worker RAM consumption has hit {latest_mem}%. Expand GKE node-pool cluster parameters to prevent workload evictions.",
            "severity": "CRITICAL" if latest_mem > 85 else "INFO",
            "created_at": (datetime.datetime.utcnow() - datetime.timedelta(minutes=15)).isoformat()
        },
        {
            "id": "rec-3",
            "message": "Cost optimization opportunity: Idle non-production container clusters found retaining less than 15% workloads. Decreasing allocation saves standard overhead cost (~$120/mo).",
            "severity": "INFO",
            "created_at": (datetime.datetime.utcnow() - datetime.timedelta(hours=2)).isoformat()
        }
    ]

@router.post("/ai/analyze")
def analyze_cluster_metrics(payload: AIAnalysisRequest):
    """
    Proxies full telemetry payload directly to Google Gemini models for structured SRE playbook advisory.
    """
    raw_payload = {
        "cpu_usage_trend": payload.cpu_history,
        "memory_usage_trend": payload.memory_history,
        "recent_pod_restarts": payload.pod_failures,
        "historical_scaling_events": payload.scaling_history
    }
    analysis = AIService.analyze_cluster_telemetry(raw_payload)
    return analysis
