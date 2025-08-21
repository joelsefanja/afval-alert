#!/bin/bash

# Auto-setup local Kubernetes with Minikube
# Usage: ./setup-local-k8s.sh YOUR_API_KEY

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 YOUR_GEMINI_API_KEY"
    echo "This script will automatically install Docker, Minikube, kubectl and deploy AfvalAlert"
    exit 1
fi

GEMINI_API_KEY="$1"

echo "🚀 Setting up local Kubernetes environment..."
echo "This will install: Docker, Minikube, kubectl"
echo "Press Enter to continue or Ctrl+C to cancel"
read

# Detect OS
OS=$(uname -s)
echo "Detected OS: $OS"

# Install Docker
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker..."
    if [[ "$OS" == "Linux" ]]; then
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        sudo usermod -aG docker $USER
        echo "⚠️  Please log out and log back in to use Docker without sudo"
    elif [[ "$OS" == "Darwin" ]]; then
        echo "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
        echo "Press Enter when Docker Desktop is installed and running..."
        read
    fi
else
    echo "✅ Docker already installed"
fi

# Install kubectl
if ! command -v kubectl &> /dev/null; then
    echo "📦 Installing kubectl..."
    if [[ "$OS" == "Linux" ]]; then
        curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
        chmod +x kubectl
        sudo mv kubectl /usr/local/bin/
    elif [[ "$OS" == "Darwin" ]]; then
        curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/darwin/amd64/kubectl"
        chmod +x kubectl
        sudo mv kubectl /usr/local/bin/
    fi
else
    echo "✅ kubectl already installed"
fi

# Install Minikube
if ! command -v minikube &> /dev/null; then
    echo "📦 Installing Minikube..."
    if [[ "$OS" == "Linux" ]]; then
        curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
        sudo install minikube-linux-amd64 /usr/local/bin/minikube
    elif [[ "$OS" == "Darwin" ]]; then
        curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-darwin-amd64
        sudo install minikube-darwin-amd64 /usr/local/bin/minikube
    fi
else
    echo "✅ Minikube already installed"
fi

# Start Minikube
echo "🚀 Starting Minikube..."
minikube start --memory=4096 --cpus=2

# Deploy AfvalAlert
echo "📦 Deploying AfvalAlert..."
./minikube-deploy.sh "$GEMINI_API_KEY"

echo "🎉 Setup complete!"
echo "✅ Local Kubernetes is running with AfvalAlert deployed"
echo "🌐 API URL: $(minikube service afval-alert-service --url)"