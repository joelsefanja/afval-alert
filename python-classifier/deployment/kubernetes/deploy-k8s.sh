#!/bin/bash

# Deploy to Kubernetes
# Usage: ./deploy-k8s.sh -k YOUR_API_KEY

set -e

GEMINI_API_KEY=""
NAMESPACE="default"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -k|--key)
            GEMINI_API_KEY="$2"
            shift 2
            ;;
        -n|--namespace)
            NAMESPACE="$2" 
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 -k YOUR_API_KEY [-n NAMESPACE]"
            echo "  -k, --key       Gemini API key (required)"
            echo "  -n, --namespace Kubernetes namespace (default: default)"
            echo "  -h, --help      Show this help"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use -h for help"
            exit 1
            ;;
    esac
done

if [ -z "$GEMINI_API_KEY" ]; then
    echo "Error: Gemini API key is required"
    echo "Usage: $0 -k YOUR_API_KEY"
    exit 1
fi

echo "🚀 Deploying AfvalAlert to Kubernetes..."
echo "Namespace: $NAMESPACE"

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl not found. Please install kubectl first."
    exit 1
fi

# Check cluster connection
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Cannot connect to Kubernetes cluster"
    echo "Please configure kubectl or start your cluster"
    exit 1
fi

echo "✅ Connected to cluster: $(kubectl config current-context)"

# Create namespace if it doesn't exist
kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

# Create secret with API key
kubectl create secret generic gemini-api-key \
    --from-literal=GEMINI_API_KEY="$GEMINI_API_KEY" \
    --namespace="$NAMESPACE" \
    --dry-run=client -o yaml | kubectl apply -f -

# Apply Kubernetes manifests
echo "📦 Applying Kubernetes manifests..."
kubectl apply -f ../k8s/ --namespace="$NAMESPACE"

# Wait for deployment
echo "⏳ Waiting for deployment to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/afval-alert-classifier --namespace="$NAMESPACE"

# Get service info
echo "🎉 Deployment complete!"
echo "📋 Service information:"
kubectl get services --namespace="$NAMESPACE"

# Try to get external IP/URL
if kubectl get service afval-alert-service --namespace="$NAMESPACE" &> /dev/null; then
    echo "🌐 Service details:"
    kubectl describe service afval-alert-service --namespace="$NAMESPACE"
fi

echo "✅ AfvalAlert is now running on Kubernetes!"