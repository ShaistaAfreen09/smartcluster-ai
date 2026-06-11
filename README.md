# SmartCluster AI

Enterprise-grade AI-powered Kubernetes resource optimization platform.

## Overview

SmartCluster AI delivers monitoring, predictive forecasting, automated scaling, cost optimization, and anomaly detection for Kubernetes clusters.

### Technology Stack

- Frontend: React + Vite + TailwindCSS
- Backend: FastAPI
- Database: PostgreSQL
- Monitoring: Prometheus, Grafana
- Machine Learning: Scikit-learn
- Infrastructure: Docker, Kubernetes

## Architecture

The repository is organized by clean architecture layers and modular subsystems:

- `backend/` - FastAPI application with domain models, services, API routers, and database access
- `frontend/` - React application with reusable components, pages, state management, and visualizations
- `infra/` - Kubernetes manifests, Helm/Chart structure, Docker build assets, and deployment scripts
- `monitoring/` - Prometheus and Grafana configuration and dashboard definitions
- `ml/` - Data processing, model training, inference, and model artifacts
- `docs/` - Architecture, deployment, and project documentation

## Folder Structure

```
backend/
frontend/
infra/
monitoring/
ml/
docs/
```

Each major area contains a dedicated `README.md` describing its purpose and how to expand it.

## Next Steps

1. Implement backend services and API endpoints.
2. Build frontend dashboards and reusable components.
3. Define Prometheus metrics ingestion and Grafana dashboards.
4. Create Kubernetes deployment manifests and developer workflows.
5. Implement ML forecasting and optimization models.
