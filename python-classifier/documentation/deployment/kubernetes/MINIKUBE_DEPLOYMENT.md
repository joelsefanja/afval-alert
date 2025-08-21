# Minikube Deployment Gids (Optioneel)

Deze gids legt uit hoe je de AfvalAlert applicatie kunt deployen naar een 
lokale Minikube Kubernetes cluster, wat perfect is voor development en testen.

**Let op: Deze setup is optioneel en alleen nodig als je Kubernetes lokaal 
wilt leren of testen. Voor normale ontwikkeling is de Docker Compose setup 
voldoende.**

## Wat is Minikube?

Minikube is een tool die een eén-node Kubernetes cluster draait in een 
virtuele machine op je lokale computer. Het is ideaal voor:
- Leren Kubernetes
- Lokale ontwikkeling
- Testen van Kubernetes deployments

## Vereisten

1. Docker
2. Minikube
3. kubectl
4. Python 3.12+ (alleen nodig voor het verkrijgen van de API key)

## Installatie van Tools

### macOS
```bash
# Installeer Homebrew als je dat nog niet hebt
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Installeer de vereiste tools
brew install docker minikube kubectl
```

### Windows
```powershell
# Installeer Chocolatey als package manager (als administrator uitvoeren)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Installeer de vereiste tools
choco install docker-desktop minikube kubernetes-cli
```

### Linux (Ubuntu/Debian)
```bash
# Installeer Docker
sudo apt update
sudo apt install docker.io

# Installeer Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Installeer kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```

## Deployment Stappen

### 1. Start Minikube
```bash
# Start Minikube met Docker driver
minikube start --driver=docker

# Controleer of het cluster draait
kubectl cluster-info
```

### 2. Verkrijg een Gemini API Key
1. Ga naar [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Log in met je Google account
3. Klik op "Create API key"
4. Kopieer de gegenereerde API key

### 3. Stel Docker omgeving in
```bash
# Configureer je shell om de Minikube Docker daemon te gebruiken
eval $(minikube docker-env)
```

### 4. Bouw de Docker image
```bash
# Ga naar de classifier directory
cd classifier

# Bouw de Docker image (deze wordt opgeslagen in de Minikube Docker registry)
docker build -t afval-alert:latest .
```

### 5. Update Kubernetes configuratie
```bash
# Ga terug naar de root directory
cd ..

# Update de image naam in deployment.yaml
sed -i 's|YOUR_ARTIFACT_REGISTRY/afval-alert:latest|afval-alert:latest|g' k8s/deployment.yaml

# Update het domein in deployment.yaml (optioneel voor lokale testen)
sed -i 's|YOUR_DOMAIN|afval-alert.local|g' k8s/deployment.yaml
```

### 6. Maak een Kubernetes secret aan
```bash
# Vervang 'your-api-key-here' met je echte Gemini API key
kubectl create secret generic gemini-api-key --from-literal=GEMINI_API_KEY=your-api-key-here
```

### 7. Deploy naar Kubernetes
```bash
# Apply alle Kubernetes configuratiebestanden
kubectl apply -f k8s/
```

### 8. Controleer deployment status
```bash
# Controleer de status van de deployment
kubectl get pods

# Controleer services
kubectl get services

# Controleer de rollout status
kubectl rollout status deployment/afval-alert
```

### 9. Toegang tot de applicatie
```bash
# Open de service in je browser
minikube service afval-alert-service

# Of verkrijg de URL zonder direct te openen
minikube service afval-alert-service --url
```

## Handige Minikube Commando's

```bash
# Stop Minikube
minikube stop

# Bekijk Minikube dashboard
minikube dashboard

# Bekijk logs van de deployment
kubectl logs deployment/afval-alert

# Bekijk beschrijving van de deployment
kubectl describe deployment/afval-alert

# SSH naar de Minikube node
minikube ssh

# Verwijder het cluster
minikube delete
```

## Problemen oplossen

### Common Issues

1. **Docker daemon niet bereikbaar**:
   ```bash
   # Zorg dat je de Minikube Docker env gebruikt
   eval $(minikube docker-env)
   ```

2. **ImagePullBackOff fout**:
   ```bash
   # Controleer of de image bestaat in de Minikube Docker registry
   docker images | grep afval-alert
   
   # Als niet, bouw de image opnieuw
   cd classifier
   docker build -t afval-alert:latest .
   ```

3. **CrashLoopBackOff fout**:
   ```bash
   # Bekijk de pod logs
   kubectl logs deployment/afval-alert
   
   # Controleer of de secret correct is aangemaakt
   kubectl get secrets
   ```

4. **Geen externe IP**:
   ```bash
   # Controleer services
   kubectl get services
   
   # Gebruik minikube service commando
   minikube service afval-alert-service
   ```

### Debuggen van Pods

```bash
# Bekijk alle pods
kubectl get pods

# Bekijk logs van een specifieke pod
kubectl logs <pod-naam>

# Bekijk beschrijving van een pod
kubectl describe pod <pod-naam>

# Exec in een pod (als het draait)
kubectl exec -it <pod-naam> -- /bin/sh
```

## Cleanup

Als je klaar bent met testen:

```bash
# Stop Minikube
minikube stop

# Of verwijder het hele cluster
minikube delete
```

## GitHub Codespaces Integratie

Bij gebruik van GitHub Codespaces wordt de deployment geautomatiseerd via de 
GitHub Actions workflow gedefinieerd in `.github/workflows/codespaces-deploy.yml`. 
Deze workflow:
1. Installeert alle benodigde tools
2. Start Minikube
3. Bouwt de Docker image
4. Deployt naar Kubernetes
5. Voert tests uit

## Volgende Stappen

1. **Test de API** via de Swagger UI op de URL die `minikube service` geeft
2. **Probeer een paar afbeeldingen** te classificeren
3. **Experimenteer met schalen**:
   ```bash
   kubectl scale deployment afval-alert --replicas=3
   ```
4. **Bekijk de Minikube dashboard** voor een visueel overzicht

## Beperkingen van Minikube Deployment

1. **Geen externe toegang**: Alleen toegankelijk vanaf je lokale machine
2. **Geen SSL**: Geen HTTPS encryptie standaard
3. **Beperkte resources**: Afhankelijk van je lokale machine specificaties
4. **Geen persistente storage**: Geen database voor statistieken

Voor productiegebruik wordt een echte Kubernetes-cluster aanbevolen zoals 
Google Kubernetes Engine (GKE), Amazon Elastic Kubernetes Service (EKS) of 
Azure Kubernetes Service (AKS). Deze clusters bieden meer robuste functies,
veilige netwerken, en schaalbaarheid voor productieomgevingen. Ze worden 
vaak gebruikt voor het hosten van containerized applicaties en biedten 
functies zoals auto-scaling, load balancing, en monitoring.

## Meer Informatie

- [Google Kubernetes Engine (GKE)](https://cloud.google.com/kubernetes-engine)
- [Amazon Elastic Kubernetes Service (EKS)](https://aws.amazon.com/eks)
- [Azure Kubernetes Service (AKS)](https://azure.microsoft.com/en-us/services/kubernetes-service)
- [Kubernetes Documentation](https://kubernetes.io/docs/home/)
- [Kubernetes Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [Kubernetes Deployment Guide](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) 
