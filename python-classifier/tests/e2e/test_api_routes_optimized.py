"""
Optimized E2E tests for AfvalAlert API routes using FastAPI TestClient
Replaces slow server startup tests with fast TestClient-based tests
"""

import pytest
from fastapi.testclient import TestClient
import os
import json
import time
from pathlib import Path
from PIL import Image
import io
import sys

# Add src directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))

from src.api.main import app

# Test configuration
client = TestClient(app)

class TestAfvalAlertAPIOptimized:
    """Optimized API route testing with TestClient"""

    def create_test_image(self, width=300, height=300, color=(255, 0, 0)):
        """Create a test image for API testing"""
        image = Image.new('RGB', (width, height), color)
        img_buffer = io.BytesIO()
        image.save(img_buffer, format='JPEG')
        img_buffer.seek(0)
        return img_buffer.getvalue()

    def test_root_endpoint(self):
        """Test root endpoint returns service information"""
        response = client.get("/")
        
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
        response = client.get("/gezondheid")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "status" in data
        assert data["status"] in ["gezond", "verminderd", "ziek"]
        assert "tijdstip" in data
        assert "configuratie_geladen" in data

    def test_model_info_endpoint(self):
        """Test model information endpoint"""
        response = client.get("/model-info")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "afval_typen" in data
        assert "totaal_afval_typen" in data
        assert isinstance(data["afval_typen"], list)
        assert len(data["afval_typen"]) > 0

    def test_waste_types_endpoint(self):
        """Test waste types endpoint"""
        response = client.get("/afval-typen")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "afval_typen" in data
        assert isinstance(data["afval_typen"], list)
        
        # Check expected categories
        expected_categories = [
            "Grofvuil", "Restafval", "Glas", "Papier en karton",
            "Organisch", "Textiel", "Elektronisch afval", 
            "Bouw- en sloopafval", "Chemisch afval", "Overig", "Geen afval"
        ]
        
        for category in expected_categories:
            assert category in data["afval_typen"]

    def test_hybrid_classification_endpoint(self):
        """Test hybrid classification endpoint (local + Gemini validation)"""
        # Create test image
        test_image = self.create_test_image(400, 400, (0, 255, 0))  # Green image
        
        response = client.post(
            "/classificeer",
            files={"afbeelding": ("afval.jpg", test_image, "image/jpeg")},
            params={"betrouwbaarheid_drempel": 0.5}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert data["afval_typen"] == [{"afval_type": "Restafval", "confidence": 1.0}]

    def test_gemini_only_classification_endpoint(self):
        """Test Gemini-only classification endpoint"""
        # Create test image
        test_image = self.create_test_image(500, 300, (0, 0, 255))  # Blue image
        
        response = client.post(
            "/classificeer_met_gemini",
            files={"afbeelding": ("afval.jpg", test_image, "image/jpeg")},
            params={"betrouwbaarheid_drempel": 0.5}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert data["afval_typen"] == [{"afval_type": "Restafval", "confidence": 1.0}]

    # def test_v2_classify_endpoint(self):
    #     """Test V2 API classification endpoint"""
    #     test_image = self.create_test_image(300, 300, (128, 128, 128))
    #
    #     response = client.post(
    #         "/api/v2/classify",
    #         files={"afbeelding": ("test.jpg", test_image, "image/jpeg")}
    #     )
    #
    #     assert response.status_code == 200
    #     data = response.json()
    #
    #     assert "afval_typen" in data
    #     assert isinstance(data["afval_typen"], list)

    # def test_v2_waste_types_endpoint(self):
    #     """Test V2 API waste types endpoint"""
    #     response = client.get("/api/v2/waste-types")
    #
    #     assert response.status_code == 200
    #     data = response.json()
    #
    #     assert "afval_typen" in data
    #     assert isinstance(data["afval_typen"], list)

    def test_api_response_format_consistency(self):
        """Test that both endpoints return consistent response formats"""
        test_image = self.create_test_image(300, 300, (128, 128, 128))
        
        # Test hybrid endpoint
        hybrid_response = client.post(
            "/classificeer", 
            files={"afbeelding": ("afval.jpg", test_image, "image/jpeg")}
        )
        
        # Test Gemini-only endpoint  
        gemini_response = client.post(
            "/classificeer_met_gemini", 
            files={"afbeelding": ("afval.jpg", test_image, "image/jpeg")}
        )
        
        assert hybrid_response.status_code == 200
        assert gemini_response.status_code == 200
        
        hybrid_data = hybrid_response.json()
        gemini_data = gemini_response.json()
        
        # Both should have same top-level structure
        for response_data in [hybrid_data, gemini_data]:
            assert "afval_typen" in response_data
            assert isinstance(response_data["afval_typen"], list)

    def test_invalid_file_upload(self):
        """Test API handles invalid file uploads correctly"""
        # Test with non-image file
        invalid_file = b"This is not an image file"
        
        response = client.post(
            "/classificeer", 
            files={"afbeelding": ("test.txt", invalid_file, "text/plain")}
        )
        assert response.status_code == 400
        
        response = client.post(
            "/classificeer_met_gemini", 
            files={"afbeelding": ("test.txt", invalid_file, "text/plain")}
        )
        assert response.status_code == 400

    def test_large_file_upload(self):
        """Test API handles large files correctly"""
        # Create oversized image (over 50MB) - but smaller for test performance
        large_image = self.create_test_image(2000, 2000, (255, 255, 255))
        
        response = client.post(
            "/classificeer", 
            files={"afbeelding": ("afval.jpg", large_image, "image/jpeg")}
        )
        
        # Should handle gracefully - either success or proper error
        assert response.status_code in [200, 413, 422, 500]

    def test_missing_file_parameter(self):
        """Test API handles missing file parameter"""
        response = client.post("/classificeer")
        assert response.status_code == 422  # FastAPI validation error
        
        response = client.post("/classificeer_met_gemini")
        assert response.status_code == 422

    def test_performance_timing(self):
        """Test that API responses are reasonably fast"""
        test_image = self.create_test_image(200, 200, (200, 100, 50))
        
        start_time = time.time()
        response = client.post(
            "/classificeer", 
            files={"afbeelding": ("afval.jpg", test_image, "image/jpeg")}
        )
        end_time = time.time()
        
        assert response.status_code == 200
        total_time = end_time - start_time
        
        # Should complete within reasonable time (increased for CI environments)
        assert total_time < 10  # 10 seconds max for TestClient

    def test_error_handling(self):
        """Test API error handling and responses"""
        # Test with empty file
        response = client.post(
            "/classificeer", 
            files={"afbeelding": ("afval.jpg", b"", "image/jpeg")}
        )
        
        # Should handle gracefully
        assert response.status_code in [400, 422, 500]
        
        if response.status_code == 500:
            # If 500, should still return JSON error format
            try:
                error_data = response.json()
                assert "error" in error_data or "detail" in error_data or "success" in error_data
            except json.JSONDecodeError:
                pytest.fail("500 error should return JSON response")

    @pytest.mark.skipif(not os.getenv("GEMINI_API_KEY"), reason="Gemini API key not available")
    @pytest.mark.slow
    def test_real_gemini_api_integration(self):
        """Test real Gemini API integration (only if API key available)"""
        # This test only runs if GEMINI_API_KEY is set
        test_image = self.create_test_image(400, 400, (100, 200, 100))
        
        response = client.post(
            "/classificeer_met_gemini", 
            files={"afbeelding": ("afval.jpg", test_image, "image/jpeg")}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # With real Gemini API, we should get meaningful responses
        assert "afval_typen" in data
        assert isinstance(data["afval_typen"], list)
        assert len(data["afval_typen"]) > 0


# commenting out tests, as v2 routes are disabled
# if __name__ == "__main__":
#     # Run tests directly
#     pytest.main([__file__, "-v"])