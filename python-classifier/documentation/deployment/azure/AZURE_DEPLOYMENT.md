# Azure Deployment Gids - AfvalAlert

Deze gids legt uit hoe je de AfvalAlert applicatie kunt deployen naar Azure 
Kubernetes Service (AKS), de beheerde Kubernetes-service van Microsoft Azure.

## Wat is Azure Kubernetes Service (AKS)?

Azure Kubernetes Service (AKS) is de beheerde Kubernetes-service van 
Microsoft Azure. Het stelt je in staat om containerized applicaties te draaien 
en schalen op het Azure-platform zonder dat je de onderliggende Kubernetes 
infrastructuur hoeft te beheren.

## Vereisten

1. **Azure Account** - Een actief Azure account met voldoende rechten
2. **Azure CLI** - Geïnstalleerd en geconfigureerd
3. **kubectl** - Kubernetes command-line tool
4. **Docker** - Voor het bouwen van container images
5. **Python 3.12+** (alleen nodig voor het verkrijgen van de API key)

## Installatie van Tools

### macOS
```bash
# Installeer Azure CLI
brew install azure-cli

# Installeer kubectl
brew install kubectl

# Installeer Docker Desktop
# Download van https://www.docker.com/products/docker-desktop
```

### Windows
```powershell
# Installeer Azure CLI
# Download van https://aka.ms/installazurecliwindows

# Installeer kubectl
# Download van https://kubernetes.io/docs/tasks/tools/install-kubectl-windows/

# Installeer Docker Desktop
# Download van https://www.docker.com/products/docker-desktop
```

### Linux (Ubuntu/Debian)
```bash
# Installeer Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Installeer kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Installeer Docker
sudo apt update
sudo apt install docker.io
```

## Azure Setup Stappen

### 1. Inloggen op Azure
```bash
# Log in op je Azure account
az login

# Controleer je huidige subscription
az account show

# (Optioneel) Selecteer een specifieke subscription
az account set --subscription <subscription-id>
```

### 2. Resource Group Aanmaken
```bash
# Definieer variabelen
export RESOURCE_GROUP="afval-alert-rg"
export LOCATION="westeurope"  # Of een andere regio naar keuze

# Maak een resource group aan
az group create --name $RESOURCE_GROUP --location $LOCATION
```

### 3. Azure Container Registry (ACR) Aanmaken
```bash
# Definieer ACR naam (moet uniek zijn binnen Azure)
export ACR_NAME="afvalalertacr$(date +%s)"

# Maak Azure Container Registry aan
az acr create --resource-group $RESOURCE_GROUP \
              --name $ACR_NAME \
              --sku Basic \
              --admin-enabled true

# Inloggen op ACR
az acr login --name $ACR_NAME
```

### 4. Configureer API Key via Azure Key Vault (Aanbevolen)
Voor productieomgevingen wordt aangeraden om Azure Key Vault te gebruiken:
1. Ga naar [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Log in met je Google account
3. Klik op "Create API key"
4. Sla de API key op in Azure Key Vault in plaats van handmatig te configureren
5. Configureer de Azure workload identity om automatisch toegang te krijgen tot de key vault

**Note**: Voor snelle testing kun je de key handmatig configureren, maar gebruik altijd Azure Key Vault voor productie.

### 5. Bouw en Push de Docker Image
```bash
# Ga naar de classifier directory
cd classifier

# Bouw de Docker image
docker build -t afval-alert:latest .

# Tag de image voor ACR
docker tag afval-alert:latest $ACR_NAME.azurecr.io/afval-alert:latest

# Push de image naar ACR
docker push $ACR_NAME.azurecr.io/afval-alert:latest
```

### 6. AKS Cluster Aanmaken
```bash
# Ga terug naar de root directory
cd ..

# Definieer cluster naam
export AKS_CLUSTER_NAME="afval-alert-aks"

# Maak AKS cluster aan (kan 10-15 minuten duren)
az aks create --resource-group $RESOURCE_GROUP \
              --name $AKS_CLUSTER_NAME \
              --node-count 1 \
              --enable-addons monitoring \
              --generate-ssh-keys \
              --attach-acr $ACR_NAME

# Verkrijg kubeconfig voor kubectl
az aks get-credentials --resource-group $RESOURCE_GROUP \
                       --name $AKS_CLUSTER_NAME
```

### 7. Kubernetes Configuratie Voorbereiden
Aangezien er nog geen Kubernetes configuratiebestanden in de repository 
aanwezig zijn, moeten we deze aanmaken.

Maak een nieuwe directory `k8s` aan in de root van het project:
```bash
mkdir k8s
```

Maak het deployment bestand `k8s/deployment.yaml`:
```bash
cat > k8s/deployment.yaml << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: afval-alert
  labels:
    app: afval-alert
spec:
  replicas: 1
  selector:
    matchLabels:
      app: afval-alert
  template:
    metadata:
      labels:
        app: afval-alert
    spec:
      containers:
      - name: afval-alert
        image: YOUR_ACR_NAME.azurecr.io/afval-alert:latest
        ports:
        - containerPort: 8000
        env:
        - name: GEMINI_API_KEY
          valueFrom:
            secretKeyRef:
              name: gemini-api-key
              key: GEMINI_API_KEY
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: afval-alert-service
spec:
  selector:
    app: afval-alert
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8000
  type: LoadBalancer
EOF
```

### 8. Update Kubernetes Configuratie met Juiste Waarden
```bash
# Vervang YOUR_ACR_NAME met de echte ACR naam
sed -i "s|YOUR_ACR_NAME|$ACR_NAME|g" k8s/deployment.yaml
```

### 9. Configureer Kubernetes Secret
Voor testing (handmatige configuratie):
```bash
# Vervang 'your-api-key-here' met je echte Gemini API key
kubectl create secret generic gemini-api-key \
  --from-literal=GEMINI_API_KEY=your-api-key-here
```

Voor productie (Azure Key Vault integratie):
```bash
# De secret wordt automatisch aangemaakt via Azure Key Vault en workload identity
# Zie Azure documentatie voor het configureren van Key Vault CSI driver
```

### 10. Deploy naar AKS
```bash
# Apply alle Kubernetes configuratiebestanden
kubectl apply -f k8s/
```

### 11. Controleer Deployment Status
```bash
# Controleer de status van de deployment
kubectl get pods

# Controleer services
kubectl get services

# Controleer de rollout status
kubectl rollout status deployment/afval-alert
```

### 12. Toegang tot de Applicatie
```bash
# Verkrijg de externe IP van de service (kan een paar minuten duren)
kubectl get service afval-alert-service

# Open de service in je browser via de externe IP
# Of gebruik port-forwarding voor directe toegang
kubectl port-forward service/afval-alert-service 8000:80
```

## Handige Azure Commando's

```bash
# Controleer AKS cluster status
az aks show --resource-group $RESOURCE_GROUP --name $AKS_CLUSTER_NAME

# Bekijk AKS cluster nodes
kubectl get nodes

# Bekijk AKS cluster events
kubectl get events

# Bekijk logs van de deployment
kubectl logs deployment/afval-alert

# Bekijk beschrijving van de deployment
kubectl describe deployment/afval-alert

# Scale de deployment
kubectl scale deployment afval-alert --replicas=3

# Verwijder de deployment
kubectl delete -f k8s/
```

## Problemen oplossen

### Common Issues

1. **ImagePullBackOff fout**:
   ```bash
   # Controleer of de image bestaat in ACR
   az acr repository list --name $ACR_NAME
   
   # Controleer of AKS toegang heeft tot ACR
   az aks show --resource-group $RESOURCE_GROUP \
               --name $AKS_CLUSTER_NAME \
               --query "identityProfile.kubeletidentity.clientId"
   ```

2. **CrashLoopBackOff fout**:
   ```bash
   # Bekijk de pod logs
   kubectl logs deployment/afval-alert
   
   # Controleer of de secret correct is aangemaakt
   kubectl get secrets
   ```

3. **Geen externe IP**:
   ```bash
   # Controleer services
   kubectl get services
   
   # Wacht tot het LoadBalancer IP is toegewezen
   kubectl get service afval-alert-service --watch
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
# Verwijder de Kubernetes resources
kubectl delete -f k8s/

# Verwijder het AKS cluster
az aks delete --resource-group $RESOURCE_GROUP --name $AKS_CLUSTER_NAME

# Verwijder de resource group (verwijdert ook ACR)
az group delete --name $RESOURCE_GROUP --yes --no-wait
```

## Kostenoverwegingen

### Azure Kostenfactoren

1. **AKS Cluster**: 
   - De AKS-control plane is gratis
   - Node pool kosten: Afhankelijk van VM-type en aantal nodes

2. **Azure Container Registry**:
   - Basic tier: $0.16/GB per maand
   - Standard tier: $0.66/GB per maand
   - Premium tier: $1.67/GB per maand

3. **Load Balancer**:
   - Data transfer kosten voor inkomend en uitgaand verkeer

4. **Storage**:
   - Kosten voor container images in ACR

### Tips om Kosten te Minimaliseren

1. **Gebruik kleinere node pools** voor testomgevingen
2. **Schakel clusters uit** wanneer je ze niet gebruikt
3. **Gebruik de Basic SKU** van ACR voor testomgevingen
4. **Monitor resource usage** via Azure Portal

## Volgende Stappen

1. **Test de API** via de externe IP of port-forwarding
2. **Probeer een paar afbeeldingen** te classificeren
3. **Experimenteer met schalen**:
   ```bash
   kubectl scale deployment afval-alert --replicas=3
   ```
4. **Bekijk Azure Monitor** voor metrics en logs
5. **Implementeer CI/CD** met Azure DevOps of GitHub Actions

## Beperkingen van Deze Setup

1. **Geen HTTPS** - Standaard wordt geen SSL/TLS geconfigureerd
2. **Geen persistente storage** - Geen database voor statistieken
3. **Beperkte monitoring** - Alleen basis monitoring via Azure Monitor
4. **Geen auto-scaling** - Handmatige schaling vereist

## Meer Informatie

- [Azure Kubernetes Service (AKS)](https://azure.microsoft.com/en-us/services/kubernetes-service)
- [Azure Container Registry](https://azure.microsoft.com/en-us/services/container-registry)
- [Azure CLI Documentation](https://docs.microsoft.com/en-us/cli/azure)
- [Kubernetes Documentation](https://kubernetes.io/docs/home)
- [Kubernetes Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet)