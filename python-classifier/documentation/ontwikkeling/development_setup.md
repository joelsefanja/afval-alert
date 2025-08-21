# Development Setup

## Overzicht

Deze gids helpt je om een complete development omgeving op te zetten voor AfvalAlert met UV package manager.

## Vereisten

### Systeem Vereisten
- **Python**: 3.9 of hoger
- **UV**: Moderne Python package manager  
- **Git**: Voor version control
- **IDE**: VS Code, PyCharm, of vergelijkbaar

### Optioneel
- **Docker**: Voor container development
- **Make**: Voor build automation (Windows: chocolatey install make)

## Installatie

### 1. UV Installeren

**Linux/Mac:**
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
source ~/.local/bin/env
```

**Windows PowerShell:**
```powershell
irm https://astral.sh/uv/install.ps1 | iex
```

**Verificatie:**
```bash
uv --version
```

### 2. Project Klonen

```bash
git clone <repository-url>
cd afval-alert/python-classifier
```

### 3. Development Environment Setup

**Automatisch (aanbevolen):**

Linux/Mac:
```bash
./scripts/setup.sh
```

Windows:
```powershell
./scripts/setup.ps1
```

**Handmatig:**
```bash
# Virtual environment aanmaken
uv venv

# Activeren (Linux/Mac)
source .venv/bin/activate

# Activeren (Windows)
.venv\Scripts\Activate.ps1

# Dependencies installeren
uv pip install -e ".[dev,test]"
```

### 4. Verificatie

```bash
# Import test
python -c "import afval_alert; print('✓ Package installed successfully')"

# Tests draaien
uv run python -m pytest tests/ -v

# Development server
uv run afval-alert server
```

## Makefile Commands

Het project heeft een Makefile met handige commands:

```bash
# Toon alle beschikbare commands
make help

# Setup development environment
make setup

# Install dependencies  
make install

# Run all tests
make test

# Run specific test suites
make test-unit
make test-integration  
make test-e2e

# Code quality
make lint        # Linting checks
make format      # Format code
make type        # Type checking
make check       # All quality checks

# Development
make run         # Run server
make dev         # Run with auto-reload
make clean       # Clean temporary files
```

## Project Structuur

```
afval-alert/python-classifier/
├── src/afval_alert/           # Hoofdapplicatie
│   ├── api/                   # FastAPI endpoints
│   ├── core/                  # Business logic
│   ├── models/                # Data schemas
│   ├── adapters/              # External services
│   ├── config/                # Configuratie systeem
│   └── utils/                 # Utilities
├── tests/                     # Test suites
│   ├── unit/                  # Unit tests
│   ├── integration/           # Integration tests
│   └── e2e/                   # End-to-end tests
├── documentation/             # Documentatie
├── scripts/                   # Setup scripts
└── pyproject.toml            # Project configuratie
```

## Development Workflow

### 1. Feature Development

```bash
# Nieuwe feature branch
git checkout -b feature/nieuwe-functie

# Code wijzigingen maken...

# Tests draaien
make test

# Code quality checks
make check

# Commit changes
git add .
git commit -m "feat: nieuwe functie implementatie"
```

### 2. Testing

```bash
# Alle tests
make test

# Specifieke test suites
make test-unit          # Unit tests (snel)
make test-integration   # Integration tests  
make test-e2e          # End-to-end tests (langzaam)

# Specifieke test files
uv run python -m pytest tests/unit/test_config.py -v

# Met coverage
uv run python -m pytest tests/ --cov=afval_alert --cov-report=html
```

### 3. Code Quality

```bash
# Automatische formatting
make format

# Linting
make lint

# Type checking
make type

# Alles in één keer
make check
```

### 4. Server Development

```bash
# Development server met auto-reload
make dev

# Server draait op: http://localhost:8000
# API docs: http://localhost:8000/docs
# ReDoc: http://localhost:8000/redoc
```

## IDE Setup

### VS Code

Aanbevolen extensions:
- Python
- Pylance  
- Black Formatter
- isort
- MyPy Type Checker

**Settings (.vscode/settings.json):**
```json
{
    "python.defaultInterpreterPath": "./.venv/bin/python",
    "python.formatting.provider": "black",
    "python.linting.enabled": true,
    "python.linting.flake8Enabled": true,
    "python.linting.mypyEnabled": true,
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.organizeImports": true
    }
}
```

### PyCharm

1. Open project in PyCharm
2. Configure Python interpreter: `.venv/bin/python`
3. Enable: Black, isort, flake8, mypy
4. Set code style to Black

## Debugging

### VS Code Debug Configuration

**(.vscode/launch.json):**
```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "FastAPI Server",
            "type": "python", 
            "request": "launch",
            "module": "afval_alert.api.main",
            "console": "integratedTerminal",
            "env": {
                "PYTHONPATH": "${workspaceFolder}/src"
            }
        },
        {
            "name": "Tests",
            "type": "python",
            "request": "launch", 
            "module": "pytest",
            "args": ["tests/", "-v"],
            "console": "integratedTerminal"
        }
    ]
}
```

### Print Debugging

```python
# Gebruik logging in plaats van print
import logging

logger = logging.getLogger(__name__)

def my_function():
    logger.debug("Debug informatie")
    logger.info("Algemene informatie") 
    logger.warning("Waarschuwing")
    logger.error("Fout opgetreden")
```

## Performance Profiling

### Basic Profiling

```bash
# Profile test suite
uv run python -m pytest tests/ --profile

# Profile specific module
uv run python -m cProfile -s cumulative src/afval_alert/api/main.py
```

### Memory Profiling

```bash
# Installeer memory profiler
uv pip install memory-profiler

# Profile memory usage
uv run python -m memory_profiler src/afval_alert/api/main.py
```

## Troubleshooting

### Veelvoorkomende Problemen

**1. Import Errors**
```bash
# Zorg dat PYTHONPATH correct is
export PYTHONPATH="${PWD}/src:${PYTHONPATH}"

# Of gebruik editable install
uv pip install -e .
```

**2. Test Failures**
```bash
# Clear pytest cache
rm -rf .pytest_cache

# Rebuild virtual environment
rm -rf .venv
make setup
```

**3. UV Issues**
```bash
# Update UV
curl -LsSf https://astral.sh/uv/install.sh | sh

# Clear UV cache
uv cache clean
```

**4. Python Version Issues**
```bash
# Check Python version
python --version  # Should be 3.9+

# Use specific Python version with UV
uv venv --python 3.11
```

### Logging Configuration

**Development logging:**
```python
# In development, set DEBUG level
import logging
logging.basicConfig(level=logging.DEBUG)
```

**Production logging:**
```python
# In production, set INFO level
import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

## Environment Variables

Voor development kan je een `.env` file gebruiken:

```bash
# .env (niet in git committen!)
DEBUG=true
LOG_LEVEL=DEBUG
GEMINI_API_KEY=your-api-key-here
```

## Next Steps

Na setup:

1. **Lees de documentatie**: `documentation/`
2. **Bekijk tests**: `tests/` voor voorbeelden
3. **Start met een kleine feature**: Begin met iets simpels
4. **Run quality checks**: `make check` voor elke commit

Happy coding! 🚀