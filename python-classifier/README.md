# AfvalAlert - Zwerfafval Classifier

AI-gestuurde API voor het classificeren van zwerfafval met hybride machine learning: lokaal MobileNetV2 model + Google Gemini LLM.

## Inhoudsopgave
- [Project Overzicht](#project-overzicht)
- [Snel Starten (Lokaal)](#snel-starten-lokaal)
- [Documentatie](#documentatie)
- [Technologieën](#technologieën)

## Project Overzicht

AfvalAlert is een slimme afvalherkenningssysteem dat foto's kan analyseren om te bepalen of ze zwerfafval bevatten. Het gebruikt een hybride aanpak met een lokaal AI model (MobileNetV2) voor snelle detectie en Google Gemini LLM voor accurate classificatie.

## Snel Starten (Lokaal)

### GitHub Codespaces (Aanbevolen)
1. Klik op de "Code" knop in de repository
2. Selecteer "Open with Codespaces"
3. Klik op "New codespace"
4. Wacht tot de omgeving is geladen
5. De applicatie start automatisch

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

## Documentatie

Voor gedetailleerde informatie over het project, zie de volgende documenten:

- [Classifier README](classifier/README.md) - Hoofddocumentatie voor de Python backend
- [Lokale Setup Gids](LOCAL_SETUP.md) - Eenvoudige lokale setup zonder cloud toegang
- [Minikube Deployment](MINIKUBE_DEPLOYMENT.md) - Instructies voor deployment naar Minikube (optioneel)
- [Deployment](DEPLOYMENT.md) - Algemene deployment informatie en scripts

## Technologieën

- **Backend**: Python, FastAPI
- **AI/ML**: TensorFlow, MobileNetV2, Google Gemini
- **Containerization**: Docker
- **Orchestration**: Kubernetes (Minikube lokaal)
- **CI/CD**: GitHub Actions
- **Development**: GitHub Codespaces

## Deployment Opties

Het project ondersteunt meerdere deployment opties:

1. **Lokaal met Docker** - Voor ontwikkeling en testen
2. **Minikube** - Lokale Kubernetes voor ontwikkeling
3. **Google Kubernetes Engine (GKE)** - Productie deployment in de cloud

Voor deployment instructies, zie de specifieke documentatie in de links hierboven.