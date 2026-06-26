#!/usr/bin/env bash
# start-cluster.sh - Automates provisioning of a local Minikube or Kind cluster for SmartCluster AI testing.

set -euo pipefail

PROVIDER="${1:-minikube}" # default to minikube, alternative: 'kind'
CLUSTER_NAME="smartcluster-dev"

echo "Initializing local Kubernetes cluster using $PROVIDER..."

if [ "$PROVIDER" = "minikube" ]; then
    if ! command -v minikube &> /dev/null; then
        echo "Error: minikube binary is missing. Please run install-kubernetes.sh first."
        exit 1
    fi
    echo "Starting minikube cluster '$CLUSTER_NAME'..."
    minikube start \
        --cluster-name="$CLUSTER_NAME" \
        --cpus=4 \
        --memory=8192 \
        --addons=ingress,metrics-server \
        --kubernetes-version=v1.28.3

    echo "Configuring docker shell context to minikube..."
    eval $(minikube -p "$CLUSTER_NAME" docker-env)

elif [ "$PROVIDER" = "kind" ]; then
    if ! command -v kind &> /dev/null; then
        echo "Error: kind binary is missing. Please run install-kubernetes.sh first."
        exit 1
    fi
    
    # Create Kind config with ingress mapping
    cat <<EOF > /tmp/kind-config.yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
    protocol: TCP
  - containerPort: 443
    hostPort: 443
    protocol: TCP
- role: worker
- role: worker
EOF

    echo "Spinning up Kind Cluster '$CLUSTER_NAME'..."
    kind create cluster --name "$CLUSTER_NAME" --config /tmp/kind-config.yaml
    
    echo "Deploying NGINX Ingress Controller for Kind..."
    kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
else
    echo "Unsupported provider: $PROVIDER. Pick 'minikube' or 'kind'."
    exit 1
fi

echo "=========================================================="
echo "Kubernetes Cluster '$CLUSTER_NAME' successfully started!"
echo "Use 'verify-cluster.sh' to inspect the provisioning log."
echo "=========================================================="
