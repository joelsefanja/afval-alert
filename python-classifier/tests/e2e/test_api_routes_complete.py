"""
Comprehensive E2E tests for AfvalAlert API routes
Tests both classification endpoints with real Gemini API integration
"""

import pytest
import requests
import os
import base64
from pathlib import Path
from PIL import Image
import io
import json
import time

# Test configuration
API_BASE_URL = "http://localhost:8000"
TEST_IMAGES_DIR = Path(__file__).parent.parent / "assets"

class TestAfvalAlertAPI:
    """Complete API route testing with real Gemini integration"""

    @pytest.fixture(autouse=True)
    def setup_method(self):
        """Setup for each test method"""
        self.api_url = API_BASE_URL
        self.headers = {"Content-Type": "application/json"}
        
        # Check if API is running
        try:
            response = requests.get(f"{self.api_url}/gezondheid", timeout=5)
            if response.status_code != 200:
                pytest.skip("API server niet beschikbaar")
        except requests.exceptions.RequestException:
            pytest.skip("Kan geen verbinding maken met API server")

    def create_test_image(self, width=300, height=300, color=(255, 0, 0)):
        """Create a test image for API testing"""
        image = Image.new('RGB', (width, height), color)
        img_buffer = io.BytesIO()
        image.save(img_buffer, format='JPEG')
        img_buffer.seek(0)
        return img_buffer.getvalue()

    def test_root_endpoint(self):
        """Test root endpoint returns service information"""
        response = requests.get(f"{self.api_url}/")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify required fields
        assert "service" in data
        assert "versie" in data
        assert "status" in data
        assert "endpoints" in data
        
        # Verify specific endpoints exist
        expected_endpoints = [
            "/classificeer",
            "/classificeer_met_gemini", 
            "/model-info",
            "/gezondheid",
            "/afval-typen"
        ]
        
        for endpoint in expected_endpoints:
            assert endpoint in data["endpoints"]

    def test_health_endpoint(self):
        """Test health check endpoint"""
        response = requests.get(f"{self.api_url}/gezondheid")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "status" in data
        assert data["status"] in ["gezond", "verminderd", "ziek"]
        assert "tijdstip" in data
        assert "configuratie_geladen" in data

    def test_model_info_endpoint(self):
        """Test model information endpoint"""
        response = requests.get(f"{self.api_url}/model-info")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "categorieën" in data
        assert "totaal_categorieën" in data
        assert isinstance(data["categorieën"], list)
        assert len(data["categorieën"]) > 0

    def test_waste_types_endpoint(self):
        """Test waste types endpoint"""
        response = requests.get(f"{self.api_url}/afval-typen")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["status"] == "success"
        assert "data" in data
        assert "afval_typen" in data["data"]
        assert "totaal" in data["data"]
        assert isinstance(data["data"]["afval_typen"], dict)

    def test_hybrid_classification_endpoint(self):
        """Test hybrid classification endpoint (local + Gemini validation)"""
        # Create test image
        test_image = self.create_test_image(400, 400, (0, 255, 0))  # Green image
        
        files = {"afbeelding": ("afval.jpg", test_image, "image/jpeg")}
        params = {"betrouwbaarheid_drempel": 0.5}
        
        response = requests.post(
            f"{self.api_url}/classificeer",
            files=files,
            params=params
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert data["status"] == "success"
        assert "data" in data
        
        response_data = data["data"]
        assert response_data["afval_typen"] == [{"afval_type": "Restafval", "confidence": 1.0}]
        
        # Verify hybrid response structure
        # assert "primaire_classificatie" not in response_data
        assert "lokaal_model" in response_data
        assert "gemini_ai" in response_data
        assert "verwerkingstijd" in response_data
        
        # Verify primary classification
        primary = response_data["primaire_classificatie"]
        assert "bron" in primary
        assert primary["bron"] in ["lokaal_model", "gemini_ai"]
        assert "afval_type" in primary
        assert "zekerheid" in primary
        
        # Verify local model results
        local = response_data["lokaal_model"]
        assert "success" in local
        assert "max_confidence" in local
        assert "voorspellingen" in local
        assert isinstance(local["voorspellingen"], list)
        
        # Verify Gemini AI results
        gemini = response_data["gemini_ai"]
        assert "is_zwerfafval" in gemini
        assert "afval_types" in gemini
        assert "kenmerken" in gemini
        assert "bedank_boodschap" in gemini
        assert isinstance(gemini["kenmerken"], list)

    def test_gemini_only_classification_endpoint(self):
        """Test Gemini-only classification endpoint"""
        # Create test image
        test_image = self.create_test_image(500, 300, (0, 0, 255))  # Blue image
        
        files = {"afbeelding": ("afval.jpg", test_image, "image/jpeg")}
        params = {"betrouwbaarheid_drempel": 0.5}
        
        response = requests.post(
            f"{self.api_url}/classificeer_met_gemini",
            files=files,
            params=params
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert data["status"] == "success"
        assert "data" in data
        
        response_data = data["data"]
        response_data = data["data"]
        assert response_data["afval_typen"] == [{"afval_type": "Restafval", "confidence": 1.0}]
        
        # Verify Gemini classification structure
        #assert "gemini_classificatie" in response_data
        
        #gemini_result = response_data["gemini_classificatie"]
        #assert "is_zwerfafval" in gemini_result
        #assert "afval_type" in gemini_result
        #assert "zekerheid" in gemini_result
        #assert "kenmerken" in gemini_result
        #assert "bedank_boodschap" in gemini_result
        #assert "verwerkingstijd" in gemini_result
        
        #Verify data types
        #assert isinstance(gemini_result["is_zwerfafval"], bool)
        #assert isinstance(gemini_result["zekerheid"], (int, float))
        #assert isinstance(gemini_result["kenmerken"], list)
        #assert isinstance(gemini_result["bedank_boodschap"], str)

    def test_api_response_format_consistency(self):
        """Test that both endpoints return consistent response formats"""
        test_image = self.create_test_image(300, 300, (128, 128, 128))
        files = {"afbeelding": ("afval.jpg", test_image, "image/jpeg")}
        
        # Test hybrid endpoint
        hybrid_response = requests.post(f"{self.api_url}/classificeer", files=files)
        
        # Test Gemini-only endpoint  
        gemini_response = requests.post(f"{self.api_url}/classificeer_met_gemini", files=files)
        
        assert hybrid_response.status_code == 200
        assert gemini_response.status_code == 200
        
        hybrid_data = hybrid_response.json()
        gemini_data = gemini_response.json()
        
        # Both should have same top-level structure
        for response in [hybrid_data, gemini_data]:
            assert "status" in response
            assert "data" in response
            assert "tijdstip" in response
            assert response["status"] == "success"

    def test_invalid_file_upload(self):
        """Test API handles invalid file uploads correctly"""
        # Test with non-image file
        invalid_file = b"This is not an image file"
        files = {"afbeelding": ("test.txt", invalid_file, "text/plain")}
        
        response = requests.post(f"{self.api_url}/classificeer", files=files)
        assert response.status_code == 400
        
        response = requests.post(f"{self.api_url}/classificeer_met_gemini", files=files)
        assert response.status_code == 400

    def test_large_file_upload(self):
        """Test API handles large files correctly"""
        # Create oversized image (over 50MB)
        large_image = self.create_test_image(5000, 5000, (255, 255, 255))
        files = {"afbeelding": ("afval.jpg", large_image, "image/jpeg")}
        
        response = requests.post(f"{self.api_url}/classificeer", files=files)
        
        # Should return 413 (Request Entity Too Large) or handle gracefully
        assert response.status_code in [413, 422, 500]

    def test_missing_file_parameter(self):
        """Test API handles missing file parameter"""
        response = requests.post(f"{self.api_url}/classificeer")
        assert response.status_code == 422  # FastAPI validation error
        
        response = requests.post(f"{self.api_url}/classificeer_met_gemini")
        assert response.status_code == 422

    def test_performance_timing(self):
        """Test that API responses include timing information"""
        test_image = self.create_test_image(200, 200, (200, 100, 50))
        files = {"afbeelding": ("afval.jpg", test_image, "image/jpeg")}
        
        start_time = time.time()
        response = requests.post(f"{self.api_url}/classificeer", files=files)
        end_time = time.time()
        
        assert response.status_code == 200
        data = response.json()
        
        # Check if processing time is included
        processing_time = data["data"]["verwerkingstijd"]
        total_time = end_time - start_time
        
        # Processing time should be reasonable
        assert 0 < processing_time < total_time
        assert processing_time < 30  # Should complete within 30 seconds

    @pytest.mark.skipif(not os.getenv("GEMINI_API_KEY"), reason="Gemini API key not available")
    def test_real_gemini_api_integration(self):
        """Test real Gemini API integration (only if API key available)"""
        # This test only runs if GEMINI_API_KEY is set
        test_image = self.create_test_image(400, 400, (100, 200, 100))
        files = {"afbeelding": ("afval.jpg", test_image, "image/jpeg")}
        
        response = requests.post(f"{self.api_url}/classificeer_met_gemini", files=files)
        
        assert response.status_code == 200
        data = response.json()
        
        # With real Gemini API, we should get meaningful responses
        gemini_result = data["data"]["gemini_classificatie"]
        
        # Check that we're not getting mock responses
        assert "Mock" not in gemini_result["bedank_boodschap"]
        assert "mock" not in str(gemini_result["kenmerken"]).lower()

    def test_error_handling(self):
        """Test API error handling and responses"""
        # Test with empty file
        files = {"afbeelding": ("afval.jpg", b"", "image/jpeg")}
        response = requests.post(f"{self.api_url}/classificeer", files=files)
        
        # Should handle gracefully
        assert response.status_code in [400, 422, 500]
        
        if response.status_code == 500:
            # If 500, should still return JSON error format
            try:
                error_data = response.json()
                assert "error" in error_data or "detail" in error_data
            except json.JSONDecodeError:
                pytest.fail("500 error should return JSON response")


# commenting out tests, as v2 routes are disabled
# if __name__ == "__main__":
#     # Run tests directly
#     pytest.main([__file__, "-v"])