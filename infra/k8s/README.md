# SmartCluster AI: Cluster Infrastructure & Deployment Module

This directory holds the YAML deployment files, Kubernetes structures, and continuous deployment workflows for **SmartCluster AI**.

## 🚀 Key Responsibilities
1. **GKE Deployments**: Templates to provision the gateway, auth, payment, and ML worker microservices.
2. **Auto-Scaling Configurations**: Native standard Horizontal Pod Autoscaler declarations used during research comparisons.
3. **Namespace Allocations**: Definitions including LimitRanges and ResourceQuotas.

## 📁 Suggested Directory Structure
```
infra/
├── k8s/
│   ├── deployment.yaml   # Microservices deployments
│   ├── ingress.yaml      # GKE Ingress controllers
│   ├── hpa.yaml          # Standard Horizontal Pod Autoscaler limits
│   └── quotas.yaml       # Namespace constraints
└── helm/
    └── prometheus/       # Helm charts for local server deployments
```
