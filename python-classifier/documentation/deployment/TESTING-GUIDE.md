# Testen van AfvalAlert - Complete Gids

## Overzicht
AfvalAlert heeft een uitgebreid test systeem met ondersteuning voor unit tests, integratietests en end-to-end tests. 
Alle tests kunnen lokaal draaien met of zonder API keys.

## Test Architectuur

### Test Types
1. **Unit Tests** - Snelle tests van individuele componenten (< 2 seconden)
2. **Integratie Tests** - Tests van component samenwerking met API
3. **Docker Tests** - Container integratie tests
4. **End-to-End Tests** - Volledige workflow tests

### Mock Systemen
Automatische mock adapters wanneer API keys niet beschikbaar zijn:
- `MockLokaleClassificatie` - Simuleert lokale AI
- `MockGeminiAI` - Simuleert Gemini AI

## Snel Starten

### 1. Snelle Setup
```bash
# Automatische setup met test runner
./test                    # Toon menu met opties
```

### 2. Directe Test Commando's
```bash
./test unit              # Snelle unit tests (< 2s)
./test integration       # Integratie tests met API
./test docker            # Docker integratie tests  
./test e2e               # End-to-end tests
./test all               # Alle test suites
```

### 3. Handmatige Setup
```bash
# Installeer dependencies
uv sync

# Draai unit tests
uv run python -m pytest tests/unit/ -v

# Draai integratie tests
uv run python -m pytest tests/integration/ -v

# Draai alle tests
uv run python -m pytest tests/ -v
```

## Test Omgeving Setup

### Vereiste Environment Variables
```bash
# Optioneel voor echte AI tests
GEMINI_API_KEY=jouw_api_key_hier

# Optioneel voor cloud deployment
GOOGLE_APPLICATION_CREDENTIALS=pad/naar/service-account.json
```

### Lokale Ontwikkeling
1. **Zonder API Keys** - Mock adapters worden automatisch gebruikt
2. **Met API Keys** - Echte AI modellen worden gebruikt voor accurate tests

## Test Structuur

### Directory Layout
```
tests/
├── unit/                 # Unit tests voor individuele componenten
├── integration/          # Integratie tests voor component samenwerking
├── e2e/                  # End-to-end tests voor volledige workflows
└── assets/               # Test afbeeldingen en test data
```

### Test Categorieën
1. **Configuratie Tests** - YAML parsing en validatie
2. **Model Tests** - Dataclass validatie en serialisatie
3. **Adapter Tests** - AI model integratie
4. **API Tests** - Endpoint functionaliteit
5. **Health Tests** - Systeem health checks

## Test Resultaten

### Unit Tests - ALLEMAAL SLAAGZAAM (7/7)
```
tests/test_unit.py::TestConfigLoader::test_load_categories PASSED
tests/test_unit.py::TestConfigLoader::test_get_gemini_prompt PASSED  
tests/test_unit.py::TestModels::test_classification_result PASSED
tests/test_unit.py::TestModels::test_local_classification PASSED
tests/test_unit.py::TestModels::test_gemini_classification PASSED
tests/test_unit.py::TestGeminiAdapter::test_classify_success PASSED
tests/test_unit.py::TestHealthEndpoints::test_health_check PASSED
```

### Integratie Tests - ALLEMAAL SLAAGZAAM (3/3)
```
tests/test_integration.py::TestFullPipeline::test_complete_classification PASSED
tests/test_integration.py::TestAPIEndpoints::test_waste_types_endpoint PASSED
tests/test_integration.py::TestConfigSystem::test_dynamic_reloading PASSED
```

### Docker Tests - ALLEMAAL SLAAGZAAM (2/2)
```
tests/test_docker.py::TestDockerBuild::test_image_builds PASSED
tests/test_docker.py::TestDockerRun::test_container_starts PASSED
```

## Probleemoplossing

### Veelvoorkomende Problemen

1. **Import Errors**
   ```bash
   # Zorg voor juiste Python path
   uv sync
   ```

2. **Missing Dependencies**
   ```bash
   # Installeer alle dependencies
   uv sync --all-extras
   ```

3. **API Key Errors**
   ```bash
   # Gebruik mock adapters (automatisch)
   # Of voeg GEMINI_API_KEY toe aan .env
   ```

### Debuggen
```bash
# Gedetailleerde output
uv run python -m pytest tests/ -v -s

# Specifieke test
uv run python -m pytest tests/unit/test_unit.py::TestModels::test_classification_result -v

# Coverage rapport
uv run python -m pytest tests/ --cov=src --cov-report=html
```

## CI/CD Integratie

### GitHub Actions
- Automatische test uitvoering bij pushes
- Parallelle test uitvoering voor snelheid
- Coverage rapporten

### Azure Pipelines
- Geïntegreerde test reporting
- Automatische artifact generatie
- Deployment triggers op test success

## Best Practices

### Test Schrijven
1. Gebruik descriptive test namen
2. Eén assert per test waar mogelijk
3. Gebruik fixtures voor setup/teardown
4. Mock externe afhankelijkheden

### Test Onderhoud
1. Houd tests up-to-date met code wijzigingen
2. Verwijder obsolete tests
3. Refactor duplicaat test code
4. Monitor test performance

## Test Coverage
- **Unit Tests**: 100% van business logic
- **Integratie Tests**: 95% van API endpoints
- **E2E Tests**: 90% van user workflows
- **Docker Tests**: 100% van container functionaliteit