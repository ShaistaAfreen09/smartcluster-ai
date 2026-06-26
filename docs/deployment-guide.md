# SmartCluster AI - Production Deployment Guide

This guide describes how to build, test, and deploy **SmartCluster AI** to local development environments, Docker Compose runtime, and production-grade Google Kubernetes Engine (GKE) clusters.

---

## 1. Local Development Setup

To run the full stack locally with hot reloading and local fallback engines:

### Prerequisites
- Node.js (v20.x or higher)
- PostgreSQL (v15.x or local Docker container)
- Optional: Configured Google Cloud project with `kubectl` authenticated to a Kubernetes Cluster

### Setup Steps
1. Clone the repository and navigate to the project root.
2. Install base Node.js dependencies:
   ```bash
   npm install
   ```
3. Set up your local `.env` environment variables using the template in `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Start the development server (runs both Vite and SRE express backend unified on port 3000):
   ```bash
   npm run dev
   ```

---

## 2. Docker Compose Execution

To test the entire production network (Frontend Nginx, Python/Node backend, and PostgreSQL Database) locally:

### Launch Steps
1. Build and boot the services in detached mode:
   ```bash
   docker-compose up --build -d
   ```
2. Verify container states:
   ```bash
   docker-compose ps
   ```
3. View runtime logs:
   ```bash
   docker-compose logs -f
   ```
4. Stop and prune all containers & network configurations:
   ```bash
   docker-compose down -v
   ```

---

## 3. Kubernetes Deployment

To perform a zero-downtime rolling update deployment on a production Kubernetes cluster (GKE, EKS, or standard self-managed cluster):

### Deployment Steps

1. Create the dedicated `smartcluster` namespace:
   ```bash
   kubectl apply -f infra/k8s/namespace.yaml
   ```

2. Register Secret parameters (ensure you populate the base64 secrets in `infra/k8s/secrets.yaml`):
   ```bash
   kubectl apply -f infra/k8s/secrets.yaml
   ```

3. Configure horizontal autoscaling, routing, and workload controllers:
   ```bash
   # Deploy internal ClusterIP routes
   kubectl apply -f infra/k8s/services.yaml

   # Deploy standard Ingress rules
   kubectl apply -f infra/k8s/ingress.yaml

   # Deploy dynamic Horizontal Pod Autoscalers (HPA)
   kubectl apply -f infra/k8s/hpa.yaml
   ```

4. Apply the core Workloads (substitute proper images or tags as required):
   ```bash
   kubectl apply -f infra/k8s/frontend-deployment.yaml
   kubectl apply -f infra/k8s/backend-deployment.yaml
   ```

5. Verify status and rollout readiness:
   ```bash
   kubectl rollout status deployment/smartcluster-frontend -n smartcluster
   kubectl rollout status deployment/smartcluster-backend -n smartcluster
   ```
