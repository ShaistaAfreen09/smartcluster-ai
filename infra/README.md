# Infrastructure

The `infra/` folder contains infrastructure as code for Kubernetes deployment.

## Purpose

- Define Docker build assets for backend and frontend services.
- Provide Kubernetes manifests and overlay configurations for cluster deployment.
- Support production-grade deployment patterns, resource management, and environment configuration.

## Key Subfolders

- `docker/` - Dockerfiles and container build utilities for services
- `k8s/base/` - reusable base Kubernetes manifests
- `k8s/overlays/` - environment-specific Kubernetes overlays
- `charts/` - Helm chart packaging for deployment
- `scripts/` - deployment, release, and bootstrap automation scripts

## Recommended Workflow

1. Build and validate Docker images.
2. Configure Kubernetes manifests for service deployment and ingress.
3. Manage environment overlays separately for development and production.
4. Automate deployment with scripts and CI-friendly commands.
