# Docker Integration Testing

## Overzicht

Docker integration tests bouwen en testen de volledige containerized applicatie. Deze tests verificeren dat:

- Docker image correct wordt gebouwd
- Container basic functionaliteit werkt 
- FastAPI server start binnen container
- API endpoints reageren correct
- Classification workflow werkt in container
- Environment variables worden correct afgehandeld

## Quick Start

### Basis Docker Tests
```bash
# Via test runner (aanbevolen)
./test docker

# Via scripts folder
python scripts/test-docker.py

# Manual pytest
cd classifier && python -m pytest tests/test_docker.py -v
```

### Vereisten
- Docker Desktop running
- Internet connectie (voor image downloads)
- ~10 minuten tijd (eerste build is langzaam)

## Test Coverage

### 1. Docker Build Test
- Bouwt image van `classifier/Dockerfile`
- Verificeert successful build
- Controleert dat image bestaat

### 2. Basic Functionality Test
- Python import tests
- FastAPI import verificatie
- Main app import check

### 3. Environment Variables Test
- Test environment variable passing
- Verificeert `GEMINI_API_KEY` handling
- Test `TEST_MODE` functionaliteit

### 4. API Server Test (Langzaam)
- Start container met FastAPI server
- Test gezondheid endpoint (`/gezondheid`)
- Test docs endpoint (`/docs`)
- Verificeert server responsiveness

### 5. Classification API Test (Langzaam)
- Full end-to-end classification test
- Upload test image via API
- Verificeert classification response structure
- Test mock/real API behavior

### 6. Docker Compose Compatibility
- Valideert `docker-compose.yml` syntax
- Controleert configuratie bestanden

## Performance

| Test | Tijd | Waarom Langzaam |
|------|------|-----------------|
| Build | ~5-10 min | TensorFlow download (600MB+) |
| Basic | ~30s | Container startup |
| API Server | ~2-3 min | Server startup + health checks |
| Classification | ~3-5 min | Full workflow + image processing |

**Totaal: ~10-15 minuten eerste keer, ~5 minuten bij herhalingen**

## Test Configuratie

### Environment Variables
```bash
# Container krijgt automatisch:
GEMINI_API_KEY=test_key      # Mock API key
TEST_MODE=true               # Forces mocking
```

### Ports
- `8001` - API server test
- `8002` - Classification test  
- Beide mappen naar container port `8000`

### Test Images
- Gebruikt echte images uit `tests/assets/`
- Fallback: genereert simple test image
- Test verschillende litter types

## Troubleshooting

### "Docker is not running"
```bash
# Start Docker Desktop eerst
docker info  # Moet succesvol zijn
```

### Build timeout/failures
```bash
# Check internet connection
ping google.com

# Manual build for debugging
docker build -t manual-test ./classifier

# Check logs
docker logs container_name
```

### Port conflicts
```bash
# Check wat draait op poorten
netstat -an | findstr "8000"

# Stop conflicting containers
docker ps
docker stop container_name
```

### Slow performance
```bash
# Clean up old images/containers
docker system prune

# Pre-pull base images
docker pull python:3.12-slim
```

## Integration met Test Runner

### Command Line
```bash
./test docker           # Via universal test runner
python scripts/test-docker.py  # Direct docker runner
```

### Interactive Menu
```bash
./test
# Kies optie 3: docker
```

### CI/CD Integration
```yaml
# GitHub Actions voorbeeld
- name: Docker tests
  run: ./test docker
  timeout-minutes: 20  # Genoeg tijd voor builds
```

## Test Output Voorbeeld

```
DOCKER INTEGRATION TESTS
========================

Testing Docker build...
Docker build successful

Testing basic container functionality...
Python version: 3.12.11
FastAPI import successful  
Main app import successful

Testing environment variables...
Environment variables working

Testing Docker API server...
Health endpoint working
Docs endpoint working

Testing classification API...
Classification successful: True
   Local confidence: 0.7
   Gemini type: restafval

Testing docker-compose compatibility...
docker-compose.yml syntax valid

SUCCESS: All Docker tests passed!
```

## Development Workflow

### Voor nieuwe features:
1. **Unit tests eerst** - `./test unit` (snel)
2. **Integration tests** - `./test integration` 
3. **Docker tests** - `./test docker` (voor deployment)

### Voor Docker changes:
1. Test lokaal: `./test docker`
2. Check CI/CD pipeline
3. Monitor deployment

**Docker tests zijn de final check voordat deployment!**