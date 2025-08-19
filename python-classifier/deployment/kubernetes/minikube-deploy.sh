#!/bin/bash

# Deploy to Minikube
# Usage: ./minikube-deploy.sh YOUR_API_KEY

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 YOUR_GEMINI_API_KEY"
    echo "Example: $0 AIzaSyC..."
    exit 1
fi

GEMINI_API_KEY="$1"

echo "🚀 Deploying AfvalAlert to Minikube..."

# Check if minikube is running
if ! minikube status | grep -q "Running"; then
    echo "❌ Minikube is not running"
    echo "Please start Minikube first: minikube start"
    exit 1
fi

echo "✅ Minikube is running"

# Use Minikube's Docker daemon
eval $(minikube docker-env)

# Build image in Minikube
echo "🔨 Building Docker image in Minikube..."
docker build -t afval-alert-classifier:latest ../classifier/

# Create secret
echo "🔐 Creating API key secret..."
kubectl create secret generic gemini-api-key \
    --from-literal=GEMINI_API_KEY="$GEMINI_API_KEY" \
    --dry-run=client -o yaml | kubectl apply -f -

# Deploy to Kubernetes
echo "📦 Deploying to Kubernetes..."
kubectl apply -f ../k8s/

# Wait for deployment
echo "⏳ Waiting for deployment..."
kubectl wait --for=condition=available --timeout=300s deployment/afval-alert-classifier

# Get service URL
echo "🎉 Deployment complete!"
minikube service afval-alert-service --url

echo "✅ AfvalAlert is now running on Minikube!"
echo "🌐 Access the API docs at: $(minikube service afval-alert-service --url)/docs"