import os
import datetime
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

# Database mapping
from .database import Base, engine

# API Router modules
from .api import (
    auth,
    clusters,
    nodes,
    pods,
    metrics,
    alerts,
    predictions,
    recommendations
)

# Create database tables upon service launch
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Warning: Relational DB table bootstrap failed: {e}")

app = FastAPI(
    title="SmartCluster AI - Autonomic Cloud Intelligence API",
    description="FastAPI service querying live GKE cluster telemetry and running ML regression projections",
    version="3.1.2-Cloud",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS middleware for standard cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Authentication Routes (accessible via /auth/*)
app.include_router(auth.router)

# Include resource modules under common /api namespace prefix
app.include_router(clusters.router, prefix="/api")
app.include_router(nodes.router, prefix="/api")
app.include_router(pods.router, prefix="/api")
app.include_router(metrics.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")
app.include_router(predictions.router, prefix="/api")
app.include_router(recommendations.router, prefix="/api")

# Classic backward-compatibility route for standard cluster router if needed
from .routers import cluster as legacy_cluster
app.include_router(legacy_cluster.router)

@app.get("/")
def get_service_root():
    return {
        "status": "ONLINE",
        "service": "SmartCluster AI Cloud Core Engine",
        "version": "3.1.2-Cloud",
        "authorizations": ["GKE_CLUSTER_READ", "PROMETHEUS_SCRAPE_QUERIES", "ML_MODEL_REGRESSION_FIT"]
    }

@app.get("/health")
@app.get("/api/health")
def get_api_health():
    return {
        "status": "healthy",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "ready": True
    }

@app.get("/ready")
def get_ready_check():
    return {
        "status": "ready",
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

# ====================================================
# WEBSOCKET STREAMING ENDPOINTS
# ====================================================

@app.websocket("/ws/metrics")
async def websocket_metrics(websocket: WebSocket):
    await websocket.accept()
    from .services.prometheus_service import PrometheusService
    prom_svc = PrometheusService()
    try:
        while True:
            history = prom_svc.get_historical_metrics()
            latest = history[-1] if history else {}
            await websocket.send_json({
                "type": "METRICS_HEARTBEAT",
                "status": "connected",
                "timestamp": datetime.datetime.utcnow().isoformat(),
                "data": latest
            })
            await asyncio.sleep(2)
    except WebSocketDisconnect:
        pass

@app.websocket("/ws/alerts")
async def websocket_alerts(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            await websocket.send_json({
                "type": "ALERTS_HEARTBEAT",
                "status": "connected",
                "timestamp": datetime.datetime.utcnow().isoformat(),
                "alerts_active": 2,
                "data": {
                    "title": "Ingress Network Spike",
                    "severity": "WARNING",
                    "message": "Aggregate request limits crossed safe margins."
                }
            })
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        pass

@app.websocket("/ws/predictions")
async def websocket_predictions(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            await websocket.send_json({
                "type": "PREDICTIONS_HEARTBEAT",
                "status": "connected",
                "timestamp": datetime.datetime.utcnow().isoformat(),
                "forecast": {
                    "predictedCpuLoad": 62.4,
                    "confidenceScore": 91.2
                }
            })
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        pass
