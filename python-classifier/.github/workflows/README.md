# GitHub Actions Workflows - Nederlandse Documentatie

Deze directory bevat de GitHub Actions workflows voor het automatisch bouwen, testen en deployen van de Zwerfafval Classifier API.

## Beschikbare Workflows

### 1. deploy-gke.yml

Deze workflow deployt de applicatie naar Google Kubernetes Engine (GKE) en wordt getriggerd bij:

1. Push naar de `main` branch
2. Push naar de `develop` branch
3. Handmatige trigger via GitHub UI (workflow_dispatch)

#### Workflow Stappen

1. **Checkout**: Haalt de broncode op van de repository
2. **Authenticate to Google Cloud**: Authenticeert met Google Cloud via Workload Identity Federation
3. **Set up Cloud SDK**: Installeert en configureert de Google Cloud SDK
4. **Configure Docker**: Configureert Docker om gcloud authenticatie te gebruiken
5. **Get GKE credentials**: Haalt de Kubernetes cluster credentials op
6. **Build Docker image**: Bouwt de Docker image voor de applicatie
7. **Publish Docker image**: Publiceert de image naar Google Artifact Registry
8. **Deploy to GKE**: Deployt de nieuwe image naar Kubernetes

#### Gebruikte Secrets

De workflow gebruikt de volgende GitHub secrets:

- `GCP_PROJECT_ID`: Het Google Cloud project ID
- `GKE_CLUSTER`: De naam van het GKE cluster
- `GKE_ZONE`: De zone waarin het GKE cluster draait
- `GCP_WIF_PROVIDER`: De Workload Identity Federation provider
- `GCP_DEPLOY_SA`: Het Google Cloud service account voor deployment

#### Environment Variabelen

De workflow definieert de volgende environment variabelen:

- `PROJECT_ID`: GCP project ID (van secret)
- `GKE_CLUSTER`: GKE cluster naam (van secret)
- `GKE_ZONE`: GKE zone (van secret)
- `DEPLOYMENT_NAME`: Naam van de Kubernetes deployment
- `IMAGE`: Naam van de Docker image

### 2. codespaces-deploy.yml

Deze workflow test de applicatie in een Minikube omgeving binnen GitHub Actions runners. Deze wordt getriggerd bij:

1. Push naar de `main` branch
2. Push naar de `develop` branch
3. Handmatige trigger via GitHub UI (workflow_dispatch)

#### Workflow Stappen

1. **Checkout code**: Haalt de broncode op
2. **Set up Python**: Installeert Python 3.12
3. **Install dependencies**: Installeert de applicatie dependencies
4. **Install Minikube**: Installeert Minikube en Kubernetes tools
5. **Start Minikube**: Start een lokale Kubernetes cluster
6. **Build Docker image**: Bouwt de Docker image in Minikube
7. **Deploy to Minikube**: Deployt de applicatie naar de lokale cluster
8. **Run tests**: Voert automatische tests uit

### 3. python-backend.yml

Deze workflow voert automatische tests uit op de Python backend code en wordt getriggerd bij elke push of pull request.

#### Workflow Stappen

1. **Checkout code**: Haalt de broncode op
2. **Set up Python**: Installeert Python 3.12
3. **Install dependencies**: Installeert de applicatie dependencies
4. **Run tests**: Voert unit tests uit
5. **Run linting**: Controleert code kwaliteit

### 4. deploy-k8s.yml

Deze workflow deployt de applicatie naar verschillende Kubernetes omgevingen (Minikube, AKS, GKE) en wordt getriggerd bij:

1. Push naar de `main` branch
2. Push naar de `develop` branch
3. Handmatige trigger via GitHub UI (workflow_dispatch) met keuze van omgeving

#### Workflow Stappen

1. **Checkout**: Haalt de broncode op van de repository
2. **Set up Python**: Installeert Python 3.12
3. **Install dependencies**: Installeert de applicatie dependencies
4. **Set up Kubernetes tools**: Installeert kubectl en Minikube indien nodig
5. **Build Docker image**: Bouwt de Docker image
6. **Create secrets**: Maakt Kubernetes secrets aan voor de Gemini API key
7. **Deploy to Kubernetes**: Deployt de applicatie naar de gekozen Kubernetes omgeving
8. **Run tests**: Voert automatische tests uit

#### Ondersteunde Omgevingen

- **Minikube**: Voor lokale testen en development
- **AKS**: Voor Azure Kubernetes Service deployment
- **GKE**: Voor Google Kubernetes Engine deployment

#### Gebruikte Secrets

De workflow gebruikt de volgende GitHub secrets (afhankelijk van de gekozen omgeving):

- `GEMINI_API_KEY`: De Google Gemini API key (vereist voor alle omgevingen)
- `AZURE_CLIENT_ID`: Azure client ID voor AKS authenticatie
- `AZURE_TENANT_ID`: Azure tenant ID voor AKS authenticatie
- `AZURE_SUBSCRIPTION_ID`: Azure subscription ID voor AKS
- `ACR_NAME`: Azure Container Registry naam
- `AKS_RESOURCE_GROUP`: Azure Kubernetes Service resource group
- `AKS_CLUSTER_NAME`: Azure Kubernetes Service cluster naam
- `GCP_PROJECT_ID`: Google Cloud project ID voor GKE
- `GKE_CLUSTER`: GKE cluster naam
- `GKE_ZONE`: GKE zone
- `GCP_WIF_PROVIDER`: Google Workload Identity Federation provider
- `GCP_DEPLOY_SA`: Google Cloud service account voor deployment

## Belangrijke Afkortingen Uitleg

- **GKE**: Google Kubernetes Engine - Google's beheerde Kubernetes service
- **GCP**: Google Cloud Platform - Google's cloud computing platform
- **IAM**: Identity and Access Management - Google's toegangsbeheersingssysteem
- **WIF**: Workload Identity Federation - Google's federated identity service voor workloads
- **Artifact Registry**: Google's container image registry
- **CI/CD**: Continuous Integration / Continuous Deployment

## Lokale Testen zonder Cloud Toegang

Voor ontwikkelaars zonder toegang tot de Google Cloud omgeving kunnen de volgende opties gebruikt worden:

1. **GitHub Codespaces**: Gebruik de ingebouwde Codespaces functionaliteit
2. **Lokale Docker**: Gebruik `make docker-dev` voor een lokale development setup
3. **Minikube lokaal**: Volg de instructies in ../documentation/MINIKUBE_DEPLOYMENT.md

Zie ook ../documentation/LOCAL_SETUP.md voor gedetailleerde instructies voor lokale setup zonder cloud toegang.