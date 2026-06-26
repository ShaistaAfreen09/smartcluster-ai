# SmartCluster AI: Prometheus Monitoring & Metrics Scraping Module

This directory contains the configurations, exporters, and client tools designed to query real-time Kubernetes CPU, memory, and networking traffic metrics.

## 🚀 Key Responsibilities
1. **Metrics Scraping Engines**: Integrate API endpoints to pull memory usage stats from `cAdvisor` and `kube-state-metrics`.
2. **Query Optimization**: Keep pre-compiled PromQL (Prometheus Query Language) scripts to cache rate ranges inside the Prometheus Server database.
3. **Status Polling Core**: Continuous health loop monitoring for live worker VMs.

## 📁 Suggested Directory Structure
```
monitoring/
├── prometheus.yml        # Main Prometheus configuration
├── alerts/
│   └── rules.yml         # Container CPU overload alerts configuration
└── exporter-scripts/     # Custom helper scrapers evaluating network sockets
```

## 🔍 Core PromQL Query Examples
- **Pod CPU Usage m**:
  `sum(rate(container_cpu_usage_seconds_total{image!=""}[5m]))`
- **Node Memory Footprint Mi**:
  `node_memory_Active_bytes / (1024 * 1024)`
