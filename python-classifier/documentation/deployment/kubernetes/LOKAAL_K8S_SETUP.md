# Lokaal Kubernetes Setup - AfvalAlert

Deze gids legt uit hoe je de AfvalAlert applicatie lokaal kunt deployen naar Kubernetes met automatische installatie van alle benodigdheden.

## Automatische Setup (Aanbevolen)

Gebruik het auto-install script voor een volledig geautomatiseerde setup:

```bash
# Download en voer het auto-install script uit
./setup-local-k8s.sh YOUR_GEMINI_API_KEY
```

Dit script installeert automatisch:
- Docker (als nog niet geïnstalleerd)
- Minikube
- kubectl
- Start Minikube
- Deployt de applicatie

## Ondersteunde Platformen

Het script ondersteunt:
- **macOS** (met Homebrew)
- **Linux** (Ubuntu/Debian en CentOS/RHEL/Fedora)
- **Windows** (via WSL2 of handmatige installatie instructies)

## Wat het Script Doet

1. **Detecteert je besturingssysteem** en kiest de juiste installatiemethode
2. **Installeert Docker** als het nog niet beschikbaar is
3. **Installeert Minikube** - lokale Kubernetes cluster
4. **Installeert kubectl** - Kubernetes command-line tool
5. **Start Minikube** met optimale instellingen voor lokale ontwikkeling
6. **Bouwt de Docker image** binnen Minikube's Docker daemon
7. **Deployt alle Kubernetes resources** (deployment, service, ingress, etc.)
8. **Configureert secrets** voor de Gemini API key
9. **Verifieert de deployment** en toont toegangsinformatie

## Handmatige Setup

Als je de automatische setup niet wilt gebruiken:

### 1. Vereisten Installeren

**macOS:**
```bash
# Installeer Docker Desktop
brew install --cask docker

# Installeer Minikube
brew install minikube

# Installeer kubectl
brew install kubectl
```

**Linux (Ubuntu/Debian):**
```bash
# Installeer Docker
sudo apt-get update
sudo apt-get install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker

# Installeer Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Installeer kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```

**Windows:**
- Installeer [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Installeer [Minikube](https://minikube.sigs.k8s.io/docs/start/)
- Installeer [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl-windows/)

### 2. Minikube Starten

```bash
# Start Minikube met Docker driver
minikube start --driver=docker

# Configureer Docker environment
eval $(minikube docker-env)
```

### 3. Applicatie Deployen

```bash
# Gebruik het bestaande deployment script
./minikube-deploy.sh YOUR_GEMINI_API_KEY
```

## Toegang tot de Applicatie

Na succesvolle deployment:

```bash
# Optie 1: Gebruik Minikube service (opent automatisch browser)
minikube service afval-alert-service

# Optie 2: Port forwarding
kubectl port-forward service/afval-alert-service 8000:80

# Optie 3: Minikube tunnel (voor LoadBalancer services)
minikube tunnel
```

Open vervolgens http://localhost:8000/docs in je browser voor de FastAPI Swagger UI.

## Troubleshooting

### Docker Issues
```bash
# Als Docker niet beschikbaar is in Minikube
minikube stop
minikube delete
minikube start --driver=docker
```

### Resource Issues
```bash
# Als de pods niet starten vanwege resource beperkingen
minikube stop
minikube start --memory=4096 --cpus=2
```

### Image Pull Errors
```bash
# Rebuild de image binnen Minikube context
eval $(minikube docker-env)
cd classifier
docker build -t afval-alert:latest .
```

### API Key Issues
```bash
# Controleer of de secret correct is aangemaakt
kubectl get secrets
kubectl describe secret gemini-api-key

# Update de secret als nodig
kubectl delete secret gemini-api-key
kubectl create secret generic gemini-api-key \
    --from-literal=GEMINI_API_KEY=your-new-api-key
```

## Ontwikkeling Workflow

Voor dagelijks gebruik:

1. **Start development environment:**
   ```bash
   minikube start
   eval $(minikube docker-env)
   ```

2. **Na code wijzigingen:**
   ```bash
   # Rebuild en redeploy
   cd classifier
   docker build -t afval-alert:latest .
   kubectl rollout restart deployment/afval-alert
   ```

3. **Monitor logs:**
   ```bash
   kubectl logs -f deployment/afval-alert
   ```

4. **Stop development environment:**
   ```bash
   minikube stop
   ```

## Verschillen met Cloud Deployment

- **Local**: Gebruikt `minikube service` voor toegang
- **Cloud**: Gebruikt LoadBalancer of Ingress met externe IP's
- **Local**: Images worden lokaal gebouwd in Minikube
- **Cloud**: Images worden gepusht naar container registry
- **Local**: Secrets worden handmatig geconfigureerd
- **Cloud**: Secrets worden beheerd via cloud secret management

## Next Steps

- Voor productie deployment: zie [AZURE_DEPLOYMENT.md](AZURE_DEPLOYMENT.md)
- Voor CI/CD: zie [CODESPACES_K8S.md](CODESPACES_K8S.md)
- Voor begrippen uitleg: zie [CLOUD_BEGRIPPEN.md](CLOUD_BEGRIPPEN.md)