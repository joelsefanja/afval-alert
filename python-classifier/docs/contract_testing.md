# Contract Testing Setup ✅

## Overzicht

De AfvalAlert API heeft nu volledige contract testing geïmplementeerd met:

1. **Swagger/OpenAPI documentatie** beschikbaar op `/docs`
2. **JSON Schema validatie** voor API responses  
3. **Pact consumer tests** voor frontend/backend contract verificatie
4. **OpenAPI schema consistency tests**

## Beschikbare Endpoints

### Swagger Documentation
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc` 
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`

### API Endpoints
- **POST /classificeer**: Afval classificatie endpoint
- **POST /debug**: Debug endpoint met pipeline details

## Contract Test Types

### 1. JSON Schema Validation (`tests/contracts/test_classification_contract.py`)
- Valideert response structure tegen gedefineerde schemas
- Test voor geldige en ongeldige responses
- Controleert data types en constraints (bijv. confidence 0.0-1.0)

### 2. Pact Consumer Tests (`tests/contracts/test_pact_consumer.py`)
- Consumer-driven contract testing
- Simuleert frontend verwachtingen
- Genereert contracts voor provider verificatie

### 3. OpenAPI Schema Tests (`tests/contracts/test_openapi_contract.py`)
- Controleert dat OpenAPI schema consistent is
- Valideert endpoint definities
- Test backward compatibility

## Response Models

### ClassificationResponse
```json
{
  "type": "Glas",
  "confidence": 0.95
}
```

### DebugResponse
```json
{
  "pipeline_steps": {
    "preprocessing": {"duration": 0.1, "status": "completed"}
  },
  "classification": [{"type": "Glas", "confidence": 0.95}],
  "processing_time": 0.6
}
```

## Running Tests

```bash
# Alle contract tests
uv run python -m pytest tests/contracts/ -v

# Specifieke test categorieën
uv run python -m pytest tests/contracts/test_classification_contract.py -v
uv run python -m pytest tests/contracts/test_openapi_contract.py -v

# Server starten voor documentatie
uv run python scripts/test_dev_server.py
```

## Implementation Details

- **FastAPI** met volledige OpenAPI metadata
- **Pydantic models** voor type safety en validation
- **jsonschema** library voor contract validation
- **pact-python** voor consumer-driven testing

## Benefits

✅ **API Documentation**: Automatisch gegenereerde, interactieve docs  
✅ **Type Safety**: Runtime validatie van request/response schemas  
✅ **Contract Verification**: Voorkomt breaking changes tussen versies  
✅ **Consumer-Driven**: Frontend kan contracts definiëren  
✅ **Backward Compatibility**: Detecteert schema wijzigingen automatisch