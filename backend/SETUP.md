# Backend Setup & Deployment

The `backend/` folder contains the FastAPI application for SmartCluster AI.

## Requirements

- Python 3.10+
- PostgreSQL (for production) or SQLite (for development)
- pip

## Installation

### 1. Create virtual environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure environment
Copy `.env.example` to `.env` and update values:
```bash
cp ../.env.example .env
```

For development, the `.env` file already uses SQLite.

### 4. Initialize database
Tables are created automatically on first run.

## Running the Application

### Development mode (with auto-reload)
```bash
cd backend
python app/main.py
```

Or using Uvicorn directly:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production mode
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Documentation

Once running, access:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/api/v1/health

## Project Structure

```
backend/
├── app/
│   ├── api/           # API routers and endpoints
│   ├── core/          # Configuration and logging
│   ├── db/            # Database utilities
│   ├── models/        # SQLAlchemy ORM models
│   ├── schemas/       # Pydantic request/response schemas
│   ├── services/      # Business logic services
│   ├── utils/         # Helper utilities
│   └── main.py        # FastAPI app initialization
├── tests/             # Test suite
├── requirements.txt   # Python dependencies
└── README.md          # This file
```

## Database

### Development (SQLite)
Default: `dev.db` in project root

### Production (PostgreSQL)
Update `DATABASE_URL` in `.env`:
```
DATABASE_URL=postgresql://username:password@localhost:5432/smartcluster
```

## API Endpoints

### Health
- `GET /api/v1/health` - Health check

### Coming soon
- Cluster management
- Node monitoring
- Pod management
- Deployment control
- Metrics and forecasting
- Recommendations and anomalies

## Logging

Logs are configured via `app/core/logger.py`. Adjust `LOG_LEVEL` in `.env`:
- DEBUG
- INFO
- WARNING
- ERROR
- CRITICAL
