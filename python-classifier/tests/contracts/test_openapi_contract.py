"""OpenAPI Schema Contract Tests"""

import json
from pathlib import Path

import pytest
import requests
from jsonschema import validate, ValidationError as JsonSchemaError


class TestOpenAPIContract:
    """Test OpenAPI schema consistency"""

    @pytest.fixture(autouse=True)
    def setup(self, test_client):
        """Setup test client"""
        self.client = test_client

    def get_openapi_schema(self):
        """Haal OpenAPI schema op van de API"""
        response = self.client.get("/openapi.json")
        assert response.status_code == 200
        return response.json()

    def test_openapi_schema_available(self):
        """Test dat OpenAPI schema beschikbaar is"""
        response = self.client.get("/openapi.json")
        assert response.status_code == 200
        
        schema = response.json()
        
        # Basis OpenAPI velden controleren
        assert "openapi" in schema
        assert "info" in schema
        assert "paths" in schema
        
        # API info controleren
        info = schema["info"]
        assert info["title"] == "AfvalAlert - Nederlandse Afval Classificatie"
        assert info["version"] == "3.0.0"

    def test_docs_endpoint_available(self):
        """Test dat /docs endpoint beschikbaar is"""
        response = self.client.get("/docs")
        assert response.status_code == 200
        assert "text/html" in response.headers["content-type"]

    def test_redoc_endpoint_available(self):
        """Test dat /redoc endpoint beschikbaar is"""
        response = self.client.get("/redoc")
        assert response.status_code == 200
        assert "text/html" in response.headers["content-type"]

    def test_classification_endpoint_in_schema(self):
        """Test dat classificatie endpoint in OpenAPI schema staat"""
        schema = self.get_openapi_schema()
        
        # Controleer of /classificeer path bestaat
        assert "/classificeer" in schema["paths"]
        
        path_info = schema["paths"]["/classificeer"]
        assert "post" in path_info
        
        post_info = path_info["post"]
        
        # Controleer request body voor file upload
        assert "requestBody" in post_info
        request_body = post_info["requestBody"]
        assert "multipart/form-data" in request_body["content"]
        
        # Controleer responses
        assert "responses" in post_info
        responses = post_info["responses"]
        
        # Verwachte response codes
        expected_codes = ["200", "400", "503"]
        for code in expected_codes:
            assert code in responses

    def test_debug_endpoint_in_schema(self):
        """Test dat debug endpoint in OpenAPI schema staat"""
        schema = self.get_openapi_schema()
        
        # Controleer of /debug path bestaat
        assert "/debug" in schema["paths"]
        
        path_info = schema["paths"]["/debug"]
        assert "post" in path_info

    def test_response_schemas_defined(self):
        """Test dat response schemas correct gedefinieerd zijn"""
        schema = self.get_openapi_schema()
        
        # Controleer components/schemas
        if "components" in schema and "schemas" in schema["components"]:
            components = schema["components"]["schemas"]
            
            # Zoek naar onze response modellen
            if "ClassificationResponse" in components:
                class_resp = components["ClassificationResponse"]
                assert "properties" in class_resp
                properties = class_resp["properties"]
                
                # Controleer vereiste velden
                assert "type" in properties
                assert "confidence" in properties
                
                # Controleer confidence constraints
                confidence = properties["confidence"]
                assert confidence["type"] == "number"
                assert confidence["minimum"] == 0.0
                assert confidence["maximum"] == 1.0

    def save_openapi_schema(self):
        """Save OpenAPI schema voor externe validatie"""
        schema = self.get_openapi_schema()
        
        # Save naar docs folder
        docs_dir = Path("docs")
        docs_dir.mkdir(exist_ok=True)
        
        with open(docs_dir / "openapi.json", "w") as f:
            json.dump(schema, f, indent=2)
        
        print(f"OpenAPI schema saved to {docs_dir / 'openapi.json'}")

    def test_contract_backward_compatibility(self):
        """Test dat contract backward compatible is"""
        # Dit zou normaal een vorige versie van het schema laden
        # en vergelijken met de huidige versie
        current_schema = self.get_openapi_schema()
        
        # Voor nu controleren we alleen dat basis structuur aanwezig is
        assert "paths" in current_schema
        assert "/classificeer" in current_schema["paths"]
        
        # In een echte implementatie zou je hier twee schema versies vergelijken
        # en controleren dat er geen breaking changes zijn