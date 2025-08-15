# Deployment Opties - AfvalAlert

Deze gids beschrijft de verschillende manieren waarop je de AfvalAlert applicatie kunt deployen, afhankelijk van je behoeften en infrastructuur.

## Deployment Opties Overzicht

1. **Lokaal met Docker** - Voor ontwikkeling en eenvoudige testen
2. **Minikube** - Lokale Kubernetes voor ontwikkeling en testen
3. **Google Kubernetes Engine (GKE)** - Productie deployment in de cloud
4. **Andere Kubernetes providers** - AWS EKS, Azure AKS, etc.

## 1. Lokale Deployment met Docker

De eenvoudigste manier om de applicatie te draaien is met Docker Compose.

### Vereisten
- Docker Desktop of Docker Engine
- Docker Compose

### Stappen
1. **Verkrijg een Gemini API Key**
   - Ga naar [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Log in met je Google account
   - Klik op "Create API key"
   - Kopieer de gegenereerde API key

2. **Configureer Environment Variabelen**
   ```bash
   # Ga naar de classifier directory
   cd classifier
   
   # Kopieer het voorbeeld environment bestand
   cp .env.example .env
   
   # Bewerk het .env bestand en voeg je Gemini API key toe
   # Vervang 'your_gemini_api_key_here' met je echte API key
   ```

3. **Start de Applicatie**
   ```bash
   # Vanuit de root directory
   make docker-dev
   
   # Of direct met Docker Compose
   docker-compose -f docker-compose.dev.yml up
   ```

4. **Toegang tot de Applicatie**
   - Open je browser
   - Ga naar http://localhost:8000
   - Voor API documentatie: http://localhost:8000/docs

### Voordelen
- Geen complexe installatie vereist
- Snelle start
- Consistente omgeving

### Beperkingen
- Geen automatische schaling
- Geen hoge beschikbaarheid
- Geen externe toegang

## 2. Minikube Deployment

Voor ontwikkelaars die Kubernetes lokaal willen testen.

### Volledige Gids
Zie [MINIKUBE_DEPLOYMENT.md](MINIKUBE_DEPLOYMENT.md) voor gedetailleerde instructies.

### Voordelen
- Leren Kubernetes
- Lokale testomgeving
- Kostenloos

### Beperkingen
- Alleen lokaal
- Beperkte resources
- Geen productieomgeving

## 3. Google Kubernetes Engine (GKE) Deployment

Voor productiegebruik in de Google Cloud.

### Automatische Deployment met GitHub Actions
1. Fork deze repository
2. Configureer de benodigde secrets in GitHub:
   - `GCP_PROJECT_ID`: Het Google Cloud project ID
   - `GKE_CLUSTER`: De naam van het GKE cluster
   - `GKE_ZONE`: De zone waarin het GKE cluster draait
   - `GCP_WIF_PROVIDER`: De Workload Identity Federation provider
   - `GCP_DEPLOY_SA`: Het Google Cloud service account voor deployment
3. Push naar main of develop branch
4. GitHub Actions deployt automatisch naar GKE

### Handmatige Deployment met Script
Gebruik het `deploy-gke.py` script voor een eenmalige deployment:

1. **Vereisten**
   - Google Cloud account met billing ingeschakeld
   - Google Cloud CLI geïnstalleerd: https://cloud.google.com/sdk/docs/install
   - kubectl geïnstalleerd: https://kubernetes.io/docs/tasks/tools/
   - Docker geïnstalleerd: https://docs.docker.com/get-docker/

2. **Gebruik**
   ```bash
   python deploy-gke.py
   ```

3. **Wat je nodig hebt**
   - Google Cloud Project ID
   - GKE Cluster naam en zone
   - Gemini API key (gratis te verkrijgen via https://makersuite.google.com/app/apikey)

### Voordelen
- Hoge beschikbaarheid
- Automatische schaling
- Professionele infrastructuur
- Zero-downtime updates

### Beperkingen
- Kosten voor cloud resources
- Complexere setup
- Google Cloud account vereist

## 4. Andere Kubernetes Providers

De applicatie kan ook worden gedeployed op andere Kubernetes providers:

### Amazon Elastic Kubernetes Service (EKS)
1. Pas de `k8s/serviceaccount.yaml` aan voor AWS IAM
2. Gebruik AWS CLI in plaats van gcloud
3. Deploy met kubectl

### Azure Kubernetes Service (AKS)
1. Pas de `k8s/serviceaccount.yaml` aan voor Azure AD
2. Gebruik Azure CLI in plaats van gcloud
3. Deploy met kubectl

## Deployment Keuzegids

| Use Case | Aanbevolen Optie | Reden |
|----------|------------------|-------|
| Lokale ontwikkeling | Docker Compose | Eenvoudig, snel, geen complexe tools |
| Leren Kubernetes | Minikube | Kostenloos, lokaal, volledige Kubernetes ervaring |
| Productie | GKE/AKS/EKS | Schaalbaar, betrouwbaar, professioneel |
| CI/CD Testen | GitHub Actions + Minikube | Automatisch testen in Kubernetes omgeving |

## Veiligheid

### API Key Management
- **Lokaal**: Gebruik `.env` bestanden, voeg deze toe aan `.gitignore`
- **Kubernetes**: Gebruik Kubernetes secrets
- **Productie**: Gebruik cloud provider secrets management (Secret Manager, Vault, etc.)

### Image Security
- Scan Docker images op kwetsbaarheden
- Gebruik signed images
- Update base images regelmatig

## Monitoring en Logging

### Lokaal
- Bekijk Docker logs: `docker logs <container-name>`
- Gebruik de `/health` endpoint

### Kubernetes
- Bekijk pod logs: `kubectl logs deployment/afval-alert`
- Gebruik Kubernetes dashboard
- Integreer met monitoring tools (Prometheus, Grafana)

## Backup en Herstel

### Configuratie
- Versioneer alle Kubernetes YAML bestanden
- Gebruik tools zoals Helm voor complexe deployments

### Data
- Voor productiegebruik, implementeer persistente storage
- Maak regelmatig backups van kritieke data

## Problemen oplossen

### Algemene Problemen
1. **Applicatie start niet**
   - Controleer API key
   - Controleer Docker logs
   - Controleer environment variabelen

2. **Kan API niet bereiken**
   - Controleer poorten
   - Controleer firewall regels
   - Controleer netwerkconnectiviteit

3. **AI classificatie werkt niet**
   - Controleer Gemini API key
   - Controleer internetconnectiviteit
   - Controleer quota in Google Cloud Console

### Specifieke Deployment Problemen
Zie de specifieke deployment documentatie voor problemen met:
- [Lokale Docker](LOCAL_SETUP.md)
- [Minikube](MINIKUBE_DEPLOYMENT.md)
- [GKE](GKE_BEGRIJPEN.md)