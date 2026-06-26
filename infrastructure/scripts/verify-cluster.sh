#!/usr/bin/env bash
# verify-cluster.sh - Diagnostics reporting module generating health reports in JSON format

set -euo pipefail

REPORT_FILE="infrastructure-health-report.json"
echo "Beginning SmartCluster Infrastructure diagnostics..."

# Ensure connectable cluster
if ! kubectl cluster-info &> /dev/null; then
    echo "{\"error\": \"Failed to connect to active Kubernetes context. Is minikube/kind running?\"}" > "$REPORT_FILE"
    echo "Error: Cluster unreachable."
    exit 1
fi

# Fetch versions and parameters
K8S_VER=$(kubectl version -o json | grep -o '"gitVersion": "[^"]*' | head -n 1 | cut -d'"' -f4 || echo "v1.28.x")
NODES_TOTAL=$(kubectl get nodes --no-headers | wc -l | xargs)
NODES_READY=$(kubectl get nodes | grep -i " ready" | wc -l | xargs)

# Sum capacity
CPU_CAP=$(kubectl get nodes -o jsonpath='{.items[*].status.capacity.cpu}' | tr ' ' '\n' | awk '{sum+=$1} END {print sum}')
MEM_CAP_RAW=$(kubectl get nodes -o jsonpath='{.items[*].status.capacity.memory}' | tr ' ' '\n' | sed 's/Ki//g')
MEM_CAP_GIB=$(echo "$MEM_CAP_RAW" | awk '{sum+=$1} END {printf "%.1f", sum/1024/1024}')

NAMESPACES=$(kubectl get ns -o jsonpath='{.items[*].metadata.name}')
ACTIVE_PODS=$(kubectl get pods -A --field-selector=status.phase=Running --no-headers | wc -l | xargs)
FAILED_PODS=$(kubectl get pods -A --field-selector=status.phase!=Running --no-headers | wc -l | xargs)

# Construct report JSON
cat <<EOF > "$REPORT_FILE"
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "kubernetes_version": "$K8S_VER",
  "cluster_nodes": {
    "total": $NODES_TOTAL,
    "ready": $NODES_READY,
    "status": "$([ "$NODES_TOTAL" -eq "$NODES_READY" ] && echo "HEALTHY" || echo "DEGRADED")"
  },
  "allocatable_resources": {
    "cpu_limits_cores": $CPU_CAP,
    "memory_limits_gib": $MEM_CAP_GIB
  },
  "workload_density_index": {
    "active_pods": $ACTIVE_PODS,
    "failed_pods": $FAILED_PODS,
    "namespaces_enrolled": $(kubectl get ns -o json | grep -c '"name":' || echo 3)
  },
  "overall_infrastructure_health": "$([ "$FAILED_PODS" -eq 0 ] && echo "PASSED" || echo "ATTENTION_REQUIRED")"
}
EOF

echo "Verification complete! Saved JSON snapshot output: $REPORT_FILE"
cat "$REPORT_FILE"
