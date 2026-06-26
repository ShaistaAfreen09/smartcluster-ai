# SmartCluster AI SRE Technical Architecture

This document maps out the telemetry processing and prediction infrastructure.

---

## Data Pipeline Flow

The telemetry data pipeline is fully authoritative:

```
+------------------------------------+
|  Kubernetes Pod cAdv / State Node  |
+------------------------------------+
                  |
                  | (Scrapes /metrics)
                  v
+------------------------------------+
|   Prometheus Time-Series Storage   |
+------------------------------------+
                  |
                  | (PromQL REST endpoints query execution)
                  v
+------------------------------------+
|   FastAPI backend (Uvicorn layer)   |
+------------------------------------+
                  |
                  | (WebSocket payload JSON / predictions regression engine)
                  v
+------------------------------------+
|       React Neon Dashboard         |
+------------------------------------+
```

- **Metrics Ingestion**: cAdvisor pulls per-container resources dynamically; node-export details capture base VM physical pressures.
- **Scraper Storage**: Prometheus indexes timestamp metrics, evaluating alert expressions for alert managers every 15 seconds.
- **FastAPI Core**: Communicates over Kube-API client queries and Prometheus Client scrapers.
- **Ensemble Fitting**: Prediction requests fit linear regression lines and random forest regressors to extrapolate future resource usage and recommend exact HPA replica settings.
- **Websockets Stream**: Continuous feeds of health statistics are broadcast to user dashboards to achieve real-time telemetry rendering.
