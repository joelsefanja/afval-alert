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
3. **Minikube lokaal**: Volg de instructies in MINIKUBE_DEPLOYMENT.md

Zie ook LOCAL_SETUP.md voor gedetailleerde instructies voor lokale setup zonder cloud toegang.