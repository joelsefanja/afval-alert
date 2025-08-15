# AfvalAlert - Zwerfafval Classifier

AI-gestuurde API voor het classificeren van zwerfafval met hybride machine learning: lokaal MobileNetV2 model + Google Gemini LLM.

## Wat is dit?

AfvalAlert is een slimme afvalherkenningssysteem dat foto's kan analyseren om te bepalen of ze zwerfafval bevatten.
Het gebruikt een hybride aanpak:

1. **Lokaal AI Model (MobileNetV2)**: Snelle eerste detectie van objecten in afbeeldingen
2. **Gemini LLM**: Intelligente analyse van de lokale resultaten voor accurate classificatie

## Snel Starten (Lokaal)

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
cp .env.example .env
# Bewerk .env en voeg je GEMINI_API_KEY toe

# 2. Start de applicatie
make docker-dev

# 3. Open http://localhost:8000/docs in je browser
```

### Lokaal zonder Docker
```bash
# 1. Installeer dependencies met uv
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

## Project Structuur
```
classifier/
├── adapters/         # Externe services (AI modellen)
├── application/      # Business logica
├── domain/           # Core modellen en interfaces
├── infrastructure/   # Implementaties
├── presentation/     # API controllers
├── shared/           # Gedeelde configuratie
├── tests/            # Testbestanden
├── .env.example      # Voorbeeld environment file
└── main.py           # Applicatie entry point
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

## Environment Variabelen

- `GEMINI_API_KEY`: Je Google Gemini API key (verplicht)
- `MODEL_PATH`: Pad naar AI modellen (optioneel)
- `TF_CPP_MIN_LOG_LEVEL`: TensorFlow log level (optioneel)

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

### Python Dependency Problemen
```bash
pip install --upgrade pip uv
uv pip install -e .
```

## Documentatie

Voor meer gedetailleerde informatie, zie de volgende documenten:
- [Lokale Setup Gids](../LOCAL_SETUP.md) - Eenvoudige lokale setup zonder cloud toegang
- [MINIKUBE_DEPLOYMENT.md](../MINIKUBE_DEPLOYMENT.md) - Gedetailleerde Minikube deployment instructies (optioneel)
- [DEPLOYMENT.md](../DEPLOYMENT.md) - Algemene deployment informatie

## Contributing
1. Fork de repository
2. Maak een feature branch
3. Commit je wijzigingen
4. Push naar de branch
5. Open een Pull Request

## Licentie
MIT License - zie LICENSE bestand voor details.