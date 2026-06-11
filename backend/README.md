# Backend

The `backend/` folder contains the FastAPI service for SmartCluster AI.

## Purpose

- Provide REST API endpoints for cluster monitoring, resource forecasting, recommendations, anomalies, and report generation.
- Manage PostgreSQL persistence through SQLAlchemy models and migrations.
- Host service orchestration, business logic, and data access.

## Key Subfolders

- `app/api/` - API routers and endpoint definitions
- `app/core/` - configuration, application settings, and shared core logic
- `app/db/` - database session, connection utilities, and migration helpers
- `app/models/` - SQLAlchemy domain models and persistence definitions
- `app/schemas/` - Pydantic request/response schemas
- `app/services/` - business services for monitoring, forecasting, and recommendations
- `app/utils/` - utility helpers, validation, and shared utilities
- `scripts/` - operational scripts such as startup, maintenance, and data ingestion helpers
- `tests/` - backend tests covering API, services, and database behavior

## Recommended Workflow

1. Define domain models and schemas.
2. Implement service interfaces and orchestration logic.
3. Add API routes that depend on service layers.
4. Write tests for every service and endpoint.
