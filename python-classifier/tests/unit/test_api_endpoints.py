"""
Unit tests for AfvalAlert API endpoints
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
import sys
from pathlib import Path

# Add src directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))

from src.api.main import app

client = TestClient(app)

class TestAPIEndpoints:
    """Test API endpoints"""
    
    def test_root_endpoint(self):
        """Test root endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "service" in data
        assert "versie" in data
        assert "model" in data
        assert "status" in data
        assert data["status"] == "actief"
    
    def test_health_check_endpoint(self):
        """Test health check endpoint"""
        response = client.get("/gezondheid")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["status"] in ["gezond", "verminderd"]
    
    def test_model_info_endpoint(self):
        """Test model info endpoint"""
        response = client.get("/model-info")
        assert response.status_code == 200
        data = response.json()
        assert "afval_typen" in data
        assert "totaal_afval_typen" in data
    
    def test_afval_typen_endpoint(self):
        """Test afval typen endpoint"""
        response = client.get("/afval-typen")
        assert response.status_code == 200
        data = response.json()
        assert "afval_typen" in data
        # Check that we have the expected categories
        expected_categories = [
            "Grofvuil", "Restafval", "Glas", "Papier en karton",
            "Organisch", "Textiel", "Elektronisch afval", 
            "Bouw- en sloopafval", "Chemisch afval", "Overig", "Geen afval"
        ]
        assert set(expected_categories).issubset(set(data["afval_typen"]))
    
    @patch('src.adapters.lokale_classificatie.SwinConvNeXtClassifier.classificeer_afbeelding')
    @patch('src.adapters.lokale_classificatie.SwinConvNeXtClassifier.krijg_tekst_beschrijving')
    @patch('src.adapters.gemini_ai.GeminiAIAdapter.valideer_lokale_resultaten')
    def test_classify_waste_hybrid_success(self, mock_gemini_validate, mock_get_description, mock_local_classify):
        """Test successful hybrid waste classification"""
        # Mock the local classifier response
        mock_local_result = Mock()
        mock_local_result.success = True
        mock_local_result.max_confidence = 0.95
        mock_local_result.predictions = [Mock(class_name="Glas", probability=0.95)]
        mock_local_result.processing_time = 0.1
        mock_local_classify.return_value = mock_local_result
        
        # Mock the text description
        mock_get_description.return_value = "Gedetecteerd: Glas (95.0%)"
        
        # Mock the Gemini validation response
        mock_gemini_result = Mock()
        mock_gemini_result.afval_types = [{"afval_type": "Glas", "zekerheid": 0.9}]
        mock_gemini_validate.return_value = mock_gemini_result
        
        # Create a mock image file
        test_image = b"fake image data"
        
        response = client.post(
            "/classificeer",
            files={"afbeelding": ("afval.jpg", test_image, "image/jpeg")}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "afval_typen" in data
        # Check that we have results with confidence scores
        assert len(data["afval_typen"]) > 0
        # Check that Glas is in the results
        glas_result = next((item for item in data["afval_typen"] if item["afval_type"] == "Glas"), None)
        assert glas_result is not None
        # The confidence should be at least 0.9 (the higher of local 0.95 and Gemini 0.9)
        assert glas_result["confidence"] >= 0.9
    
    @patch('src.adapters.gemini_ai.GeminiAIAdapter.analyseer_afbeelding')
    def test_classify_waste_with_gemini_success(self, mock_gemini_analyze):
        """Test successful Gemini-only waste classification"""
        # Mock the Gemini analysis response
        mock_gemini_result = Mock()
        mock_gemini_result.is_afval = True
        mock_gemini_result.afval_types = [{"afval_type": "Glas", "zekerheid": 0.85}]
        mock_gemini_analyze.return_value = mock_gemini_result
        
        # Create a mock image file
        test_image = b"fake image data"
        
        response = client.post(
            "/classificeer_met_gemini",
            files={"afbeelding": ("afval.jpg", test_image, "image/jpeg")}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "afval_typen" in data
        # Check that we have results with confidence scores
        assert len(data["afval_typen"]) > 0
        # Check that Glas is in the results
        glas_result = next((item for item in data["afval_typen"] if item["afval_type"] == "Glas"), None)
        assert glas_result is not None
        # The confidence should be at least 0.85
        assert glas_result["confidence"] >= 0.85
    
    def test_classify_waste_invalid_file_type(self):
        """Test classification with invalid file type"""
        test_data = b"fake text data"
        
        response = client.post(
            "/classificeer",
            files={"afbeelding": ("test.txt", test_data, "text/plain")}
        )
        
        assert response.status_code == 400
    
    def test_classify_waste_gemini_invalid_file_type(self):
        """Test Gemini classification with invalid file type"""
        test_data = b"fake text data"
        
        response = client.post(
            "/classificeer_met_gemini",
            files={"afbeelding": ("test.txt", test_data, "text/plain")}
        )
        
        assert response.status_code == 400

if __name__ == "__main__":
    pytest.main([__file__, "-v"])