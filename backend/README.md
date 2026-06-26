# SmartCluster AI: Backend API Module

This directory contains the Python-based API server responsible for scraping telemetry, executing mathematical projections, and routing requests for **SmartCluster AI**.

## 🚀 Key Responsibilities
1. **Workload Management Loop**: Simulates and tracks node performance profiles across varying scenario stress models.
2. **Metrics Ingestion Port**: Interacts with Kubernetes API endpoints and Prometheus scrapers.
3. **ML Broker Connection**: Pulls Scikit-learn results and feeds forecasting metrics to client consumers.
4. **Gemini Recommendations Agent**: Dispatches container stats to server-side Gemini prompts to generate optimized GKE policies.

## 📁 Suggested Directory Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI application initialization
│   ├── config.py         # Credentials and database specifications
│   ├── db.py             # SQLAlchemy schemas and database engine
│   └── routers/          # Cluster status, scaling, and predictions routers
├── requirements.txt      # Python dependencies
└── Dockerfile            # Container build blueprints
```

## 🛠️ Main Libraries Spec
- **FastAPI** (Asynchronous Python microservice framework)
- **Uvicorn** (Asgi server running on port 8000/3000)
- **SQLAlchemy** (PostgreSQL CRUD mapper)
- **Pydantic** (Metrics schema validators)
