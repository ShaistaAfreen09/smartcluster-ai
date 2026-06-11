# Monitoring

The `monitoring/` folder contains observability configuration for Prometheus and Grafana.

## Purpose

- Collect Kubernetes, pod, and node metrics through Prometheus.
- Define dashboards and panels in Grafana for cluster health and forecasting.
- Support alerting, rules, and monitoring pipelines.

## Key Subfolders

- `prometheus/` - Prometheus scrape configuration and rule definitions
- `grafana/dashboards/` - dashboard JSON definitions for Grafana UI
- `grafana/provisioning/` - provisioning files for dashboards and data sources

## Recommended Workflow

1. Define Prometheus scrape targets and recording rules.
2. Create Grafana dashboards for resource utilization and ML insights.
3. Provision Grafana data sources and dashboards automatically.
4. Connect monitoring pipelines to backend and Kubernetes services.
