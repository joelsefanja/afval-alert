# AfvalAlert - Zwerfafval Classifier

AI-gestuurde API voor het classificeren van zwerfafval met hybride machine learning: lokaal MobileNetV2 model + Google Gemini LLM.

## Wat is dit?

AfvalAlert is een slimme afvalherkenningssysteem dat foto's kan analyseren om te bepalen of ze zwerfafval bevatten.
Het gebruikt een hybride aanpak:

1. **Lokaal AI Model (MobileNetV2)**: Snelle eerste detectie van objecten in afbeeldingen
2. **Gemini LLM**: Intelligente analyse van de lokale resultaten voor accurate classificatie

## GitHub Codespaces

Dit project is geconfigureerd om naadloos te werken met GitHub Codespaces, wat een complete ontwikkelomgeving in de cloud biedt. 
De Codespaces omgeving bevat:
- Python 3.12
- Docker
- Kubernetes tools (kubectl, minikube)
- Alle benodigde dependencies zijn vooraf geïnstalleerd

## Waarom Docker & Kubernetes?

### Docker
Docker maakt onze applicatie portabel en eenvoudig te draaien:
- **Consistentie**: Werkt hetzelfde op jouw computer als op de server
- **Isolatie**: Alles wat de app nodig heeft zit in de container
- **Snelheid**: Start binnen seconden zonder installatie

### Kubernetes
Kubernetes zorgt voor betrouwbaarheid en schaalbaarheid:
- **High Availability**: Meerdere kopieën van de app draaien tegelijk
- **Auto-scaling**: Meer instanties bij hoge belasting
- **Self-healing**: Herstart automatisch bij problemen
- **Zero-downtime updates**: Updates zonder downtime

## Architectuur Keuzes

1. **Hybride AI**: Lokaal model voor snelheid, LLM voor nauwkeurigheid
2. **Clean Architecture**: Modulaire structuur voor onderhoudbaarheid
3. **Environment-based Config**: Flexibele configuratie via .env bestanden
4. **GKE Workload Identity**: Veilige authenticatie zonder hardcoded keys

## Snel Starten

### GitHub Codespaces (Aanbevolen)
De eenvoudigste manier om te starten is met GitHub Codespaces:
1. Klik op de "Code" knop in de repository
2. Selecteer "Open with Codespaces"
3. Klik op "New codespace"
4. Wacht tot de omgeving is geladen (duurt ongeveer 2-3 minuten)
5. De applicatie start automatisch met hot reloading

### Lokaal met Docker (Aanbevolen)
```bash
# 1. Kopieer environment file en vul je Gemini API key in
cp classifier/.env.example classifier/.env
# Bewerk classifier/.env en voeg je GEMINI_API_KEY toe

# 2. Start de applicatie
make docker-dev

# 3. Open http://localhost:8000/docs in je browser
```

### Lokaal zonder Docker
```bash
# 1. Installeer dependencies met uv
cd classifier
pip install --upgrade pip uv
uv pip install -e .

# 2. Kopieer environment file en vul je Gemini API key in
cp .env.example .env
# Bewerk .env en voeg je GEMINI_API_KEY toe

# 3. Start de server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 4. Open http://localhost:8000/docs in je browser
```

## API Gebruik

### Classificeren van Afbeeldingen
```bash
# Met curl
curl -X POST "http://localhost:8000/classify" \
     -H "accept: application/json" \
     -H "Content-Type: multipart/form-data" \
     -F "file=@pad/naar/afbeelding.jpg"
```

### Andere Endpoints
- `GET /` - API informatie
- `GET /health` - Health check
- `GET /waste-types` - Lijst van alle afvaltypen

## Deployment naar Kubernetes (Minikube)

### GitHub Codespaces Deployment
De eenvoudigste manier om te deployen is via GitHub Actions in Codespaces:
1. De workflow wordt automatisch gestart bij push naar main/develop
2. Je kunt ook handmatig de workflow starten via de GitHub Actions tab

### Lokale Minikube Deployment
Je kunt de applicatie lokaal deployen naar een Minikube cluster:

1. **Start Minikube**:
   ```bash
   minikube start --driver=docker
   ```

2. **Stel Docker omgeving in**:
   ```bash
   eval $(minikube docker-env)
   ```

3. **Bouw de Docker image**:
   ```bash
   cd classifier
   docker build -t afval-alert:latest .
   ```

4. **Deploy naar Kubernetes**:
   ```bash
   # Update de image naam in deployment.yaml
   sed -i 's|YOUR_ARTIFACT_REGISTRY/afval-alert:latest|afval-alert:latest|g' ../k8s/deployment.yaml
   
   # Apply Kubernetes configuratie
   kubectl apply -f ../k8s/
   
   # Wacht tot deployment klaar is
   kubectl rollout status deployment/afval-alert
   ```

5. **Toegang tot de applicatie**:
   ```bash
   minikube service afval-alert-service
   ```

### Handmatige Deployment
```bash
# 1. Authenticeer met Google Cloud
gcloud auth login

# 2. Set project
gcloud config set project YOUR_PROJECT_ID

# 3. Verkrijg cluster credentials
gcloud container clusters get-credentials YOUR_CLUSTER_NAME --zone YOUR_ZONE

# 4. Deploy Kubernetes resources
kubectl apply -f k8s/

# 5. Configureer secrets (éénmalig)
kubectl create secret generic gemini-api-key \
    --from-literal=GEMINI_API_KEY="jouw_api_key_hier"
```

## Environment Variabelen

### Lokaal (Docker)
- `GEMINI_API_KEY`: Je Google Gemini API key (verplicht voor lokale Docker)

### GKE
- Gebruikt Workload Identity voor authenticatie (veiliger dan API keys)

## Project Structuur
```
python-classifier/
├── classifier/           # Hoofdapplicatie
│   ├── adapters/         # Externe services (AI modellen)
│   ├── application/      # Business logica
│   ├── domain/          # Core modellen en interfaces
│   ├── infrastructure/   # Implementaties
│   ├── presentation/     # API controllers
│   ├── shared/           # Gedeelde configuratie
│   ├── tests/            # Testbestanden
│   ├── .env.example      # Voorbeeld environment file
│   └── main.py           # Applicatie entry point
├── k8s/                  # Kubernetes configuratie
├── .github/workflows/    # CI/CD workflows
├── docker-compose.yml    # Productie Docker setup
├── docker-compose.dev.yml # Development Docker setup
└── Makefile              # Handige commando's
```

## Commando's

### Development
```bash
make help          # Toon alle beschikbare commando's
make install       # Installeer dependencies met uv
make dev           # Start development server
make test          # Run alle tests
make docker-dev    # Start met Docker (development)
make docker-run    # Start met Docker (production)
make docker-down   # Stop Docker services
```

### Minikube
```bash
make minikube-start  # Start Minikube cluster
make minikube-deploy # Deploy naar Minikube
make minikube-stop   # Stop Minikube cluster
```

## Veelgestelde Vragen

### Waarom GKE Workload Identity in plaats van API keys?
Workload Identity is veiliger omdat:
1. Geen hardcoded keys in code of configuratie
2. Automatische key rotation
3. Fine-grained toegangscontrole
4. Audit logging van alle API calls

### Kan ik dit lokaal testen zonder GKE?
Ja! Voor lokale ontwikkeling kun je gewoon een API key gebruiken via het .env bestand. De code detecteert automatisch of het lokaal draait of in GKE.

### Hoe schaal ik de applicatie?
In GKE wordt automatisch geschaald op basis van CPU gebruik. Voor handmatige schaling:
```bash
kubectl scale deployment afval-alert --replicas=5
```

## Problemen oplossen

### API Key Fouten
Controleer of je .env bestand correct is ingevuld en de API key geldig is.

### Docker Problemen
Probeer:
```bash
make docker-down
docker system prune -a
make docker-dev
```

### Kubernetes Problemen
Bekijk logs:
```bash
kubectl logs deployment/afval-alert
```

## Contributing
1. Fork de repository
2. Maak een feature branch
3. Commit je wijzigingen
4. Push naar de branch
5. Open een Pull Request

## Licentie
MIT License - zie LICENSE bestand voor details.