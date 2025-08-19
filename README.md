# Afval Alert

Zwerfafval meldsysteem met AI-classificatie voor Groningen.

## Development Setup

### Lokaal zonder Docker
```bash
cd python-classifier
make setup    # Setup ontwikkelomgeving met UV
make run      # Start API server (http://localhost:8000)
make test     # Run tests
```

### Lokaal met Docker
```bash
cd python-classifier
docker-compose up -d    # Start services
```

### Technologieën
- **AI Classifier:** FastAPI + Python + Gemini API
- **Frontend:** Angular 
- **Backend:** Spring Boot
- **Database:** PostgreSQL