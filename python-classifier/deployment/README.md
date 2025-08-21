# Deployment Scripts

Scripts voor het deployen van AfvalAlert naar verschillende omgevingen.

## Scripts

### `setup-local-k8s.sh`
Automatische setup van lokale Kubernetes omgeving met Minikube.

```bash
./setup-local-k8s.sh YOUR_GEMINI_API_KEY
```

Installeert automatisch:
- Docker (Linux/Mac)
- kubectl
- Minikube
- Deployt AfvalAlert

### `minikube-deploy.sh`
Deploy naar bestaande Minikube installatie.

```bash
./minikube-deploy.sh YOUR_GEMINI_API_KEY
```

### `deploy-k8s.sh`
Deploy naar bestaande Kubernetes cluster.

```bash
./deploy-k8s.sh -k YOUR_GEMINI_API_KEY [-n NAMESPACE]
```

Opties:
- `-k, --key` - Gemini API key (verplicht)
- `-n, --namespace` - Kubernetes namespace (default: default)
- `-h, --help` - Help

## Vereisten

- Voor lokale setup: Geen (scripts installeren alles)
- Voor bestaande clusters: kubectl geconfigureerd
- Voor alle deployments: Gemini API key

## Gebruik

1. **Nieuwe lokale omgeving**: `./setup-local-k8s.sh YOUR_KEY`
2. **Bestaande Minikube**: `./minikube-deploy.sh YOUR_KEY`
3. **Productie cluster**: `./deploy-k8s.sh -k YOUR_KEY`