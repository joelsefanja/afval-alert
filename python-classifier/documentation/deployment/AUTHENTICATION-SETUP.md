# Authenticatie Setup voor AfvalAlert

## Overzicht
AfvalAlert ondersteunt authenticatie voor zowel lokale ontwikkeling als CI/CD omgevingen met slimme authenticatiedetectie.

## Lokale Ontwikkeling Setup

### 1. Maak Omgevingsbestand Aan
```bash
# Kopieer template
cp classifier/.env.example classifier/.env

# Bewerk met je API key
echo "GEMINI_API_KEY=jouw_werkelijke_api_key_hier" >> classifier/.env
```

### 2. API Key Bronnen
- **Lokaal**: Gebruikt `.env` bestand met `GEMINI_API_KEY`
- **CI/CD**: Gebruikt Google Cloud service account authenticatie

### 3. Environment Variables
```bash
# Vereist voor Gemini AI tests
GEMINI_API_KEY=your_api_key_here

# Optioneel voor cloud deployment
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
```

## CI/CD Authenticatie

### GitHub Actions
Automatisch via repository secrets:
- `GEMINI_API_KEY` - Voor snelle tests
- `GOOGLE_CREDENTIALS` - Voor volledige deployment

### Azure Pipelines
Geconfigureerd via pipeline variabelen:
- Service connection voor Kubernetes
- Key Vault voor geheime waarden

## Testen Zonder API Keys
Mock adapters worden automatisch gebruikt als er geen API keys beschikbaar zijn:
- `MockLokaleClassificatie` - Simuleert lokale AI
- `MockGeminiAI` - Simuleert Gemini AI

## Veilige Opslag
- Gebruik nooit echte API keys in code
- Gebruik `.gitignore` voor `.env` bestanden
- Gebruik cloud key management services in productie