# Prometheus & Alerting Stack Configuration

Deploy a fully-featured monitoring stack to read raw workloads, request rates, cAdvisor containers limit usage, and alerts channels.

## 1. Deploying Prometheus Monitoring Core

Inside the monitoring stack path, run the following manifests:

```bash
# Create Monitoring workspace
kubectl create namespace monitoring

# Apply ConfigurationMaps (contains PromQL targets and alert-rules)
kubectl apply -f monitoring/prometheus/prometheus-config.yaml
kubectl apply -f monitoring/prometheus/alert-rules.yaml

# Apply Prometheus Server and mapping IP
kubectl apply -f monitoring/prometheus/deployment.yaml
```

---

## 2. Deploying Alertmanager Rules

Setup Alertmanager alerting routes, SMTP channels, and backend FastAPI webhook receivers:

```bash
# Deploy configuration maps
kubectl create configmap alertmanager-config \
    --from-file=alertmanager.yaml=monitoring/alertmanager/alertmanager-config.yaml \
    -n monitoring
```

---

## 3. Configuring Grafana Dashboards

Deploy standard visualization consoles for cAdvisors, nodes, and CPU metrics:

```bash
# Apply datasources configuration matching cluster mapping
kubectl apply -f monitoring/grafana/datasources.yaml

# Create the primary monitoring dashboard Console using SRE configurations:
# JSON descriptor is located in: monitoring/dashboards/cluster-metrics.json
```
