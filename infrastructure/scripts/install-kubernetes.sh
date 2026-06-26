#!/usr/bin/env bash
# install-kubernetes.sh - Bootstrapping environment utilities for Minikube, Kind & kubectl
# Supports Linux, macOS, and Windows (via Cygwin/WSL)

set -euo pipefail

OS="$(uname -s)"
echo "Targeting Host OS: $OS"

install_kubectl() {
    echo "Checking for kubectl..."
    if ! command -v kubectl &> /dev/null; then
        echo "kubectl not found. Downloading the recommended release..."
        if [ "$OS" = "Linux" ]; then
            curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
            chmod +x ./kubectl
            sudo mv ./kubectl /usr/local/bin/kubectl
        elif [ "$OS" = "Darwin" ]; then
            brew install kubectl || {
                curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/darwin/amd64/kubectl"
                chmod +x ./kubectl
                sudo mv ./kubectl /usr/local/bin/kubectl
            }
        else
            echo "Please run inside WSL or utilize Chocolatey / Winget: winget install Kubernetes.kubectl"
            exit 1
        fi
    else
        echo "kubectl is already installed: $(kubectl version --client -o json | grep gitVersion)"
    fi
}

install_minikube() {
    echo "Checking for Minikube..."
    if ! command -v minikube &> /dev/null; then
        echo "Installing Minikube..."
        if [ "$OS" = "Linux" ]; then
            curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
            sudo install minikube-linux-amd64 /usr/local/bin/minikube
            rm minikube-linux-amd64
        elif [ "$OS" = "Darwin" ]; then
            brew install minikube || {
                curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-darwin-amd64
                sudo install minikube-darwin-amd64 /usr/local/bin/minikube
                rm minikube-darwin-amd64
            }
        else
            echo "Please register minikube via winget: winget install Google.Minikube"
            exit 1
        fi
    else
        echo "Minikube is already installed: $(minikube version)"
    fi
}

install_kind() {
    echo "Checking for Kind (Kubernetes in Docker)..."
    if ! command -v kind &> /dev/null; then
        echo "Installing Kind..."
        if [ "$OS" = "Linux" ]; then
            curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.22.0/kind-linux-amd64
            chmod +x ./kind
            sudo mv ./kind /usr/local/bin/kind
        elif [ "$OS" = "Darwin" ]; then
            brew install kind || {
                curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.22.0/kind-darwin-amd64
                chmod +x ./kind
                sudo mv ./kind /usr/local/bin/kind
            }
        fi
    else
        echo "Kind is already installed: $(kind version)"
    fi
}

install_kubectl
install_minikube
install_kind

echo "========================================="
echo "Kubernetes tooling installation completed."
echo "========================================="
