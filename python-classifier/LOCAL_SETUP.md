# Lokale Setup Gids - Zwerfafval Classifier

Deze gids helpt je bij het opzetten van de AfvalAlert applicatie op je lokale machine zonder cloud toegang.

## Vereisten

1. **Python 3.12+**
2. **Docker** (optioneel maar aanbevolen)
3. **Git**
4. **Make** (optioneel, handige commando's)

## Setup Stappen

### 1. Kloon de Repository
```bash
git clone <repository-url>
cd python-classifier
```

### 2. Verkrijg een Gemini API Key
1. Ga naar [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Log in met je Google account
3. Klik op "Create API key"
4. Kopieer de gegenereerde API key

### 3. Configureer Environment Variabelen
```bash
# Ga naar de classifier directory
cd classifier

# Kopieer het voorbeeld environment bestand
cp .env.example .env

# Bewerk het .env bestand en voeg je Gemini API key toe
# Vervang 'your_gemini_api_key_here' met je echte API key
```

### 4. Start de Applicatie

#### Optie A: Met Docker (Aanbevolen)
```bash
# Vanuit de root directory
make docker-dev

# Of direct met Docker Compose
docker-compose -f docker-compose.dev.yml up
```

#### Optie B: Zonder Docker
```bash
# Installeer dependencies
make install

# Of handmatig:
pip install --upgrade pip uv
uv pip install -e .

# Start de server
make dev

# Of direct:
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Toegang tot de Applicatie
1. Open je browser
2. Ga naar http://localhost:8000
3. Voor API documentatie: http://localhost:8000/docs

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
# Vanuit de classifier directory
pip install --upgrade pip uv
uv pip install -e .
```

## Commando's Overzicht

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

## Volgende Stappen

1. **Test de API** met de Swagger documentatie op http://localhost:8000/docs
2. **Probeer een paar afbeeldingen** te classificeren
3. **Bekijk de code** in de classifier directory
4. **Lees de uitgebreide documentatie** in classifier/README.md

## Beperkingen van Lokale Setup

Deze lokale setup heeft enkele beperkingen vergeleken met de volledige cloud deployment:

1. **Geen automatische schaling** - Alleen lokaal draaiend
2. **Geen externe toegang** - Alleen toegankelijk vanaf je lokale machine
3. **Geen persistente storage** - Geen database voor statistieken
4. **Geen SSL** - Geen HTTPS encryptie

Voor productiegebruik wordt een Kubernetes deployment aanbevolen (zie MINIKUBE_DEPLOYMENT.md).