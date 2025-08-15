# Deployment Opties - AfvalAlert

Deze gids beschrijft de verschillende manieren waarop je de AfvalAlert applicatie kunt deployen, afhankelijk van je behoeften en infrastructuur.

## Deployment Opties Overzicht

1. **Lokaal met Docker** - Voor ontwikkeling en eenvoudige testen
2. **Minikube** - Lokale Kubernetes voor ontwikkeling en testen (optioneel)

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

## 2. Minikube Deployment (Optioneel)

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

## Deployment Keuzegids

| Use Case | Aanbevolen Optie | Reden |
|----------|------------------|-------|
| Lokale ontwikkeling | Docker Compose | Eenvoudig, snel, geen complexe tools |
| Leren Kubernetes | Minikube | Kostenloos, lokaal, volledige Kubernetes ervaring |

## Veiligheid

### API Key Management
- **Lokaal**: Gebruik `.env` bestanden, voeg deze toe aan `.gitignore`

### Image Security
- Scan Docker images op kwetsbaarheden
- Gebruik signed images
- Update base images regelmatig

## Monitoring en Logging

### Lokaal
- Bekijk Docker logs: `docker logs <container-name>`
- Gebruik de `/health` endpoint

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
- [Minikube](MINIKUBE_DEPLOYMENT.md) (optioneel)