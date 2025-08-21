"""Unit tests for API endpoints"""

import pytest
from fastapi.testclient import TestClient
from src.controller import app

# Test client
client = TestClient(app)

class TestAPIEndpoints:
    """Unit tests for API endpoints"""
    
    def test_root_endpoint(self):
        """Test root endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "service" in data
        assert data["service"] == "AfvalAlert Nederlandse Afval Classificatie"

    def test_status_endpoint(self):
        """Test status endpoint"""
        response = client.get("/status")
        assert response.status_code == 200
        data = response.json()
        assert "lokaal_model" in data
        assert "gemini_ai" in data
        assert "overall_status" in data
    
    def test_debug_endpoint_without_file(self):
        """Test debug endpoint without file"""
        response = client.post("/debug")
        # Should fail because no file was provided
        assert response.status_code == 422

if __name__ == "__main__":
    pytest.main([__file__, "-v"])