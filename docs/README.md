# SmartCluster AI - Operations & SRE Playbook Manuals

Welcome to the production Kubernetes environment configuration guide and operations playbook for SmartCluster AI.

The folders and files in this directories guide you through setting up a complete site reliability engineering (SRE) topology matching top-tier enterprise observabilities:

- **Local Kubernetes Setup**: Detailed instructions in [kubernetes-setup.md](./kubernetes-setup.md) for local Minikube, Kind, or Docker Desktop environments.
- **Monitoring Stack**: Steps to configure Prometheus, Alertmanager, Grafana visualizers, and Alert flows in [prometheus-setup.md](./prometheus-setup.md).
- **Architecture Flow**: Full-stack components, datapath mapping (Cluster -> Prometheus -> FastAPI Backend -> WebSocket client frontend dashboard) in [architecture.md](./architecture.md).
- **Diagnostics & Troubleshooting**: Actionable error-code overrides and service debugging tips in [troubleshooting.md](./troubleshooting.md).

## Topology Overview

```
                  +--------------------------------+
                  |    Google Kubernetes Engine    |
                  |     / Local Minikube/Kind      |
                  +--------------------------------+
                                  |
                                  v
                  +--------------------------------+
                  |  Prometheus scraping engine   |
                  |  (Metrics, cAdvisors & nodes)  |
                  +--------------------------------+
                                  |
                                  v
                  +--------------------------------+
                  |     FastAPI Backend Core       |
                  | (ML Regression, SRE API Router)|
                  +--------------------------------+
                                  |
            +---------------------+---------------------+
            |                                           |
            v (REST APIs)                               v (WebSockets)
  +-------------------+                       +-------------------+
  | React Dashboard   |                       | Real-time Alerts /|
  | (Insights Panel)  |                       | CPU Live Metrics  |
  +-------------------+                       +-------------------+
```
