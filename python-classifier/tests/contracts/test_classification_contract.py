"""Contract Tests voor Classification API"""

import json
from pathlib import Path
from typing import Any, Dict

import pytest
from jsonschema import validate, ValidationError as JsonSchemaError


class TestClassificationContract:
    """Contract testing voor afval classificatie endpoints"""

    def get_classification_schema(self) -> Dict[str, Any]:
        """OpenAPI schema voor classificatie response"""
        return {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "type": {
                        "type": "string",
                        "description": "Type afval (bijv. 'Grofvuil', 'Restafval', 'Glas', 'Papier en karton', 'Organisch', 'Textiel', 'Elektronisch afval', 'Bouw- en sloopafval', 'Chemisch afval', 'Overig', 'Geen afval')"
                    },
                    "confidence": {
                        "type": "number",
                        "minimum": 0.0,
                        "maximum": 1.0,
                        "description": "Betrouwbaarheidsscore tussen 0 en 1"
                    }
                },
                "required": ["type", "confidence"],
                "additionalProperties": False
            },
            "minItems": 1
        }

    def get_debug_schema(self) -> Dict[str, Any]:
        """OpenAPI schema voor debug response"""
        return {
            "type": "object",
            "properties": {
                "pipeline_steps": {
                    "type": "object",
                    "description": "Details van pipeline stappen"
                },
                "classification": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "type": {"type": "string"},
                            "confidence": {"type": "number", "minimum": 0.0, "maximum": 1.0}
                        },
                        "required": ["type", "confidence"]
                    }
                },
                "processing_time": {
                    "type": "number",
                    "minimum": 0.0,
                    "description": "Verwerkingstijd in seconden"
                }
            },
            "required": ["pipeline_steps", "classification", "processing_time"],
            "additionalProperties": False
        }

    def test_classification_response_contract(self):
        """Test dat classificatie response voldoet aan contract"""
        # Mock response data
        response_data = [
            {"type": "Glas", "confidence": 0.95},
        {"type": "Restafval", "confidence": 0.85}
        ]
        
        schema = self.get_classification_schema()
        
        # Dit zou niet moeten falen
        try:
            validate(instance=response_data, schema=schema)
        except JsonSchemaError as e:
            pytest.fail(f"Classificatie response voldoet niet aan contract: {e}")

    def test_debug_response_contract(self):
        """Test dat debug response voldoet aan contract"""
        # Mock debug response data
        response_data = {
            "pipeline_steps": {
                "preprocessing": {"duration": 0.1, "status": "completed"},
                "model_inference": {"duration": 0.5, "status": "completed"}
            },
            "classification": [
                {"type": "Glas", "confidence": 0.95}
            ],
            "processing_time": 0.6
        }
        
        schema = self.get_debug_schema()
        
        # Dit zou niet moeten falen
        try:
            validate(instance=response_data, schema=schema)
        except JsonSchemaError as e:
            pytest.fail(f"Debug response voldoet niet aan contract: {e}")

    def test_invalid_classification_response(self):
        """Test dat ongeldige classificatie response wordt afgewezen"""
        invalid_responses = [
            # Ontbrekende confidence
            [{"type": "Glas"}],
            # Confidence buiten bereik
            [{"type": "Glas", "confidence": 1.5}],
            # Negatieve confidence
            [{"type": "Glas", "confidence": -0.1}],
            # Verkeerd type voor confidence
            [{"type": "Glas", "confidence": "hoog"}],
            # Lege array
            []
        ]
        
        schema = self.get_classification_schema()
        
        for invalid_response in invalid_responses:
            with pytest.raises(JsonSchemaError):
                validate(instance=invalid_response, schema=schema)

    def test_invalid_debug_response(self):
        """Test dat ongeldige debug response wordt afgewezen"""
        invalid_responses = [
            # Ontbrekende velden
            {"pipeline_steps": {}, "classification": []},
            # Negatieve processing_time
            {
                "pipeline_steps": {},
                "classification": [{"type": "Glas", "confidence": 0.95}],
                "processing_time": -0.1
            },
            # Ongeldige classificatie in debug
            {
                "pipeline_steps": {},
                "classification": [{"type": "Glas"}],  # Ontbrekende confidence
                "processing_time": 0.5
            }
        ]
        
        schema = self.get_debug_schema()
        
        for invalid_response in invalid_responses:
            with pytest.raises(JsonSchemaError):
                validate(instance=invalid_response, schema=schema)

    def test_api_contract_integration(self, test_client):
        """Integratie test die echte API response controleert"""
        # Create een test afbeelding
        test_image = b"fake_image_data"
        
        # Test /classificeer endpoint
        files = {"afbeelding": ("test.jpg", test_image, "image/jpeg")}
        response = test_client.post("/classificeer", files=files)
        
        # Controleer status code
        assert response.status_code in [200, 400, 503]  # Verwachte codes
        
        if response.status_code == 200:
            # Valideer response tegen contract
            schema = self.get_classification_schema()
            try:
                validate(instance=response.json(), schema=schema)
            except JsonSchemaError as e:
                pytest.fail(f"API response voldoet niet aan contract: {e}")

    def save_contract_schemas(self):
        """Save schemas voor externe contract testing tools"""
        contracts_dir = Path("tests/contracts/schemas")
        contracts_dir.mkdir(exist_ok=True)
        
        # Save classificatie schema
        with open(contracts_dir / "classification_response.json", "w") as f:
            json.dump(self.get_classification_schema(), f, indent=2)
        
        # Save debug schema
        with open(contracts_dir / "debug_response.json", "w") as f:
            json.dump(self.get_debug_schema(), f, indent=2)