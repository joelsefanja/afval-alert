"""End-to-end tests for the complete AfvalAlert system"""

import os
import io
import pytest
from PIL import Image
from fastapi.testclient import TestClient
from src.controller import app

# Test client
client = TestClient(app)

def create_test_image(format='PNG', size=(100, 100)) -> bytes:
    """Create a simple test image in the requested format"""
    image = Image.new('RGB', size, color='red')
    image_bytes = io.BytesIO()
    
    if format.upper() == 'JPEG':
        image.save(image_bytes, format='JPEG', quality=95)
    else:
        image.save(image_bytes, format=format.upper())
    
    image_bytes.seek(0)
    return image_bytes.getvalue()

class TestCompleteSystemE2E:
    """End-to-end tests for the complete AfvalAlert system"""
    
    def test_system_root_endpoint(self):
        """Test that the system root endpoint works"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "service" in data
        assert data["service"] == "AfvalAlert Nederlandse Afval Classificatie"

    def test_system_status_endpoint(self):
        """Test that system status is available"""
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