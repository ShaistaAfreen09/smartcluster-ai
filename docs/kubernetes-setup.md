# Local Kubernetes Environment Setup Guide

SmartCluster AI integrates natively with both container pools in local dev environment and production-scale Google Kubernetes Engine (GKE) clusters.

## Prerequisite Commands

Run the automation tool chain inside the directory to auto-install CLI requirements (`kubectl`, `minikube` / `kind`):

```bash
chmod +x ./infrastructure/scripts/*.sh

# Run tool package installation
./infrastructure/scripts/install-kubernetes.sh
```

---

## 1. Initializing Clusters

To provision a local testbed with standard resource allocations:

### Using Minikube (Acoustic Ingress & Metrics Servers auto-bundled)
```bash
./infrastructure/scripts/start-cluster.sh minikube
```

### Using Kind (Kubernetes in Docker)
```bash
./infrastructure/scripts/start-cluster.sh kind
```

---

## 2. Deploying Microservice Workloads

Inject the realistic SRE sandbox workloads (API Gateway, Payment, User, and Analytics queues) to spin up metrics scrapers:

```bash
# Initialize Namespace
kubectl apply -f k8s/namespace.yaml

# Push microservices
kubectl apply -f k8s/deployments/
kubectl apply -f k8s/services/

# Map Ingress Layer
kubectl apply -f k8s/ingress.yaml
```

---

## 3. Running Telemetry Verification

Execute the diagnostic script to compile node metrics, allocations, and namespace health values into a structured JSON report format:

```bash
./infrastructure/scripts/verify-cluster.sh
```
This generates `infrastructure-health-report.json` containing total nodes Ready state and pods allocations for the FastAPI backend.
