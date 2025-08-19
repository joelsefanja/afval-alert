# AfvalAlert - Clean Architecture Implementation

## Overview

AfvalAlert heeft een complete herstructurering ondergaan naar een schone, SOLID en DRY architectuur zonder hardcoded constanten. Alle configuratie is nu uitbreidbaar en klaar voor toekomstige database-integratie.

## Key Achievements

### SOLID Principles Implementation
- **Single Responsibility**: Elke klasse heeft één duidelijke verantwoordelijkheid
- **Open/Closed**: Uitbreidbaar via dependency injection zonder wijzigingen
- **Liskov Substitution**: Alle interfaces zijn vervangbaar
- **Interface Segregation**: Gefocuste interfaces voor elke concern  
- **Dependency Inversion**: Afhankelijk van abstracties, niet van concrete implementaties

### DRY Principle
- Centrale configuratie manager elimineert code duplicatie
- Single source of truth voor alle constanten en instellingen
- Herbruikbare componenten door het hele systeem

### Extensible Architecture
- Mock implementaties voor ontwikkeling en testing
- Clear interfaces voor alle externe services

### Configuration-Driven Architecture
- Alle constanten verplaatst van code naar YAML configuratie
- Extensible voor toekomstige database integratie
- Caching en validatie systeem geïmplementeerd

## Project Structure

```
afval-alert/
├── src/afval_alert/           # Schone package structuur
│   ├── api/                   # FastAPI endpoints
│   ├── core/                  # Business logic  
│   ├── models/                # Data schemas (geen hardcoded constanten)
│   ├── adapters/              # External service interfaces
│   │   ├── lokale_classificatie.py # Lokale AI model adapter
│   │   └── gemini_ai.py       # Google Gemini AI adapter
│   ├── config/                # SOLID configuratie systeem
│   │   ├── interfaces.py      # Configuratie interfaces
│   │   ├── implementations.py # Concrete implementaties
│   │   ├── loader.py          # DRY configuratie service
│   │   └── data/              # YAML configuratie bestanden
│   └── utils/                 # Utilities (zonder Unicode)
```

## UV Virtual Environment

Alle scripts gebruiken nu consistent UV voor dependency management:

### Setup
```bash
# Linux/Mac
./scripts/setup.sh

# Windows PowerShell  
./scripts/setup.ps1

# Manual setup
uv venv
uv pip install -e ".[dev,test]"
```

### Development Commands
```bash
# Via Makefile
make setup     # Setup environment
make test      # Run all tests  
make dev       # Start development server
make lint      # Code quality checks

# Direct UV commands
uv run afval-alert server    # Start server
uv run afval-alert-test      # Run tests
uv run pytest tests/unit/   # Specific test suite
```

### Automated Testing with Datasets
```bash
# Download datasets and run all tests
python scripts/download_datasets_simple.py    # Download only
python scripts/run_all_tests_with_datasets.py # Download + run tests

# Datasets will be stored in:
# - tests/assets/zwerfafval/        (litter images)
# - tests/assets/geen-zwerfafval/   (nature images)
```

## Configuration System

### YAML-Based Constants
Alle constanten zijn verplaatst naar configuratie:

```yaml
# src/afval_alert/config/data/constants.yaml
waste_types:
  plastic_flessen: "plastic_flessen"
  # ... etc

api_defaults:
  max_file_size_mb: 50
  timeout_seconds: 30
  
response_messages:
  success: "Classificatie succesvol voltooid"
  file_too_large: "Bestand te groot (max {max_size}MB)"
```

### Extensible Architecture
Ready voor database integratie:

```python
# Huidige file-based implementatie
config_service = ConfigurationFactory.create_file_based()

# Toekomstige database implementatie  
config_service = ConfigurationFactory.create_database_based(connection_string)
```

## Benefits

### 1. Maintainability
- Geen god classes - elke module heeft gefocuste verantwoordelijkheid
- Clear separation of concerns  
- Easy to locate en modify code
- Consistent patterns throughout

### 2. Extensibility  
- Easy to add nieuwe waste types via YAML
- Plugin architecture voor nieuwe adapters
- Database-ready configuratie systeem
- Interface-driven design

### 3. Testability
- Easy to mock dependencies
- Clear test boundaries  
- Isolated test failures
- No Unicode issues in test output

### 4. Performance
- Configuration caching system
- Lazy loading van configuratie
- Graceful error handling
- Efficient lookup structures

### 5. Developer Experience
- UV-based development workflow
- IDE support voor navigation
- Clear import structure  
- Comprehensive documentation

## Test Strategy

Tests zijn nu volledig Unicode-vrij:

```bash
# All tests
uv run python -m pytest tests/ -v

# Specific suites  
uv run python -m pytest tests/unit/ -v
uv run python -m pytest tests/integration/ -v
uv run python -m pytest tests/e2e/ -v

# End-to-end tests met echte Gemini API
uv run python run_e2e_test.py

# Of met pytest
uv run python -m pytest tests/e2e/test_real_gemini_e2e.py -v
```

### End-to-End Tests met Echte Gemini API

Voor het uitvoeren van E2E tests met de echte Google Gemini API:

1. Zorg dat je een `.env` bestand hebt met je `GEMINI_API_KEY`:
   ```
   GEMINI_API_KEY=AIzaSyCqI9AsDznUdE5OKRhdhrHKbxdUD8YlJfc
   ```

2. Run de E2E test:
   ```bash
   uv run python run_e2e_test.py
   ```

De test zal:
- Een lokale server starten op poort 8006
- Gezondheid en basis endpoints testen
- Een classificatie uitvoeren met de echte Gemini API
- De server weer stoppen

## API Endpoints

All endpoints nu configuration-driven:

- `GET /` - Service informatie (uit configuratie)
- `GET /gezondheid` - Gezondheid check  
- `GET /model-info` - Model details (uit configuratie)
- `GET /afval-typen` - Afval categorieën (uit YAML)
- `POST /classificeer` - Classificeer afval afbeelding
- `GET /documentatie` - API documentatie

## Future Database Integration

Architecture is ready voor database integratie:

```python
# Interface blijft hetzelfde
config_service = ConfigurationFactory.create_database_based(
    connection_string="postgresql://..."
)

# Alle bestaande code blijft werken
waste_types = config_service.get_waste_type_names()
```

## Code Quality

All scripts en tools gebruiken UV:

```bash
make lint      # Linting met UV
make format    # Code formatting
make type      # Type checking  
make check     # Complete quality check
```

## Documentatie

Voor uitgebreide documentatie, zie de [documentatie map](documentation/) die onderverdeeld is in:

- **[Architectuur](documentation/architectuur/)** - Technische architectuur en design principes
- **[Configuratie](documentation/configuratie/)** - Configuratie systeem en bestanden
- **[Deployment](documentation/deployment/)** - Deployment instructies en scripts
  - **[Algemeen](documentation/deployment/general/)** - Algemene deployment informatie
  - **[Azure](documentation/deployment/azure/)** - Azure Kubernetes Service deployment
  - **[Kubernetes](documentation/deployment/kubernetes/)** - Kubernetes setup en begrippen
  - **[Lokaal](documentation/deployment/local/)** - Lokale setup en testing
  - **[Testen](documentation/deployment/)** - Test gids en authenticatie setup
- **[Ontwikkeling](documentation/ontwikkeling/)** - Ontwikkel setup en workflows

Project voldoet nu aan:
- SOLID principles
- DRY principle  
- Clean Architecture
- Configuration-driven design
- Unicode-free test output
- UV-based dependency management

Perfect voor verdere ontwikkeling en uitbreiding!