#  SmartCluster AI

<div align="center">

### AI-Powered Kubernetes Monitoring & Infrastructure Analytics Platform

Monitor Kubernetes clusters, visualize infrastructure health, analyze system metrics, and explore AI-assisted operational insights through an intuitive dashboard.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://python.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)](https://docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)



</div>



##  Overview

SmartCluster AI is a cloud infrastructure monitoring platform inspired by modern Kubernetes observability tools.

The application provides an interactive dashboard that visualizes infrastructure metrics, cluster status, workload information, and AI-generated operational insights. It demonstrates how monitoring data can be analyzed to help administrators understand resource utilization and infrastructure health.

The project combines a modern React frontend with a FastAPI backend, Google OAuth authentication, and modular monitoring components to provide an enterprise-inspired monitoring experience.


#  Features

- 🔐 Google OAuth Authentication
- 📊 Interactive Monitoring Dashboard
- ☸ Kubernetes Cluster Visualization
- 📈 CPU & Memory Usage Monitoring
- 📡 Infrastructure Metrics Dashboard
- 🤖 AI-Based Operational Insights
- 📉 Performance Analytics
- 🔍 Workload Monitoring
- 👥 Role-Based User Access
- 🌙 Dark & Light Theme Support
- ⚡ Responsive UI
- 🔄 REST API Integration


#  System Architecture


```
                User
                  │
                  ▼
        React + TypeScript Frontend
                  │
                  ▼
            FastAPI Backend
                  │
     ┌────────────┼────────────┐
     ▼            ▼            ▼
 Google OAuth   Monitoring   AI Analysis
                  │
                  ▼
      Simulated Kubernetes Metrics
```



#  Dashboard Modules

- Authentication
- Infrastructure Overview
- Cluster Monitoring
- Resource Utilization
- Workload Analytics
- AI Insights
- User Management
- System Configuration


#  Tech Stack

| Category | Technology |
|-----------|------------|
| Frontend | React, TypeScript, Vite |
| Backend | FastAPI, Python |
| Authentication | Google OAuth 2.0 |
| Monitoring | Prometheus (architecture ready) |
| Infrastructure | Kubernetes (simulation/demo architecture) |
| Deployment | Google Cloud Run |
| Containerization | Docker |



#  Project Structure


```
smartcluster-ai
│
├── backend/
├── frontend/
├── monitoring/
├── ml/
├── docs/
├── src/
├── tests/
├── docker-compose.yml
├── package.json
└── README.md
```





#  Getting Started

## Clone Repository

```bash
git clone https://github.com/ShaistaAfreen09/smartcluster-ai.git

cd smartcluster-ai
```

## Install Dependencies

```bash
npm install
```

Backend

```bash
pip install -r requirements.txt
```


#  Environment Variables

Create a `.env` file and configure:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
JWT_SECRET=
DATABASE_URL=
```


#  Run the Project

Frontend

```bash
npm run dev
```

Backend

```bash
uvicorn backend.app.main:app --reload
```



#  Monitoring

The dashboard provides visualizations for:

- CPU Usage
- Memory Usage
- Cluster Health
- Node Status
- Workload Information
- Resource Allocation
- Performance Metrics



#  Authentication

Authentication is implemented using **Google OAuth 2.0**.

Authenticated users can securely access the monitoring dashboard and protected application routes.






#  Future Improvements

- Real Kubernetes Cluster Integration
- Prometheus Live Metrics
- Grafana Integration
- Alert Notifications
- Predictive Autoscaling
- Multi-Cluster Monitoring
- Log Analytics
- AI-Based Failure Prediction


#  Contributing

Contributions are welcome.

Feel free to fork the repository, open issues, or submit pull requests.


#  License

This project is licensed under the MIT License.
