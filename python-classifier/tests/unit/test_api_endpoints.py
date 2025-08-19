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
        assert "categorieën" in data
        assert "totaal_categorieën" in data
    
    def test_waste_types_endpoint(self):
        """Test waste types endpoint"""
        response = client.get("/afval-typen")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "data" in data
        assert "afval_typen" in data["data"]
    
    @patch('src.adapters.lokale_classificatie.SwinConvNeXtClassifier.classificeer_afbeelding')
    @patch('src.adapters.lokale_classificatie.SwinConvNeXtClassifier.krijg_tekst_beschrijving')
    @patch('src.adapters.gemini_ai.GeminiAIAdapter.valideer_lokale_resultaten')
    def test_classify_waste_hybrid_success(self, mock_gemini_validate, mock_get_description, mock_local_classify):
        """Test successful hybrid waste classification"""
        # Mock the local classifier response
        mock_local_result = Mock()
        mock_local_result.success = True
        mock_local_result.max_confidence = 0.95
        mock_local_result.predictions = [Mock(class_name="plastic_flessen", probability=0.95)]
        mock_local_result.processing_time = 0.1
        mock_local_classify.return_value = mock_local_result
        
        # Mock the text description
        mock_get_description.return_value = "Gedetecteerd: plastic_flessen (95.0%)"
        
        # Mock the Gemini validation response
        mock_gemini_result = Mock()
        mock_gemini_result.afval_types = [{"afval_type": "plastic_flessen", "zekerheid": 0.9}]
        mock_gemini_result.kenmerken = ["plastic", "transparant"]
        mock_gemini_result.bedank_boodschap = "Bedankt voor je melding!"
        mock_gemini_validate.return_value = mock_gemini_result
        
        # Create a mock image file
        test_image = b"fake image data"
        
        response = client.post(
            "/classificeer",
            files={"afbeelding": ("test.jpg", test_image, "image/jpeg")}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "data" in data
        assert "primary_classification" in data["data"]
    
    @patch('src.adapters.gemini_ai.GeminiAIAdapter.analyseer_afbeelding')
    def test_classify_waste_with_gemini_success(self, mock_gemini_analyze):
        """Test successful Gemini-only waste classification"""
        # Mock the Gemini analysis response
        mock_gemini_result = Mock()
        mock_gemini_result.is_afval = True
        mock_gemini_result.afval_types = [{"afval_type": "plastic_flessen", "zekerheid": 0.85}]
        mock_gemini_result.kenmerken = ["plastic", "transparant"]
        mock_gemini_result.bedank_boodschap = "Bedankt voor je melding!"
        mock_gemini_analyze.return_value = mock_gemini_result
        
        # Create a mock image file
        test_image = b"fake image data"
        
        response = client.post(
            "/classificeer_met_gemini",
            files={"afbeelding": ("test.jpg", test_image, "image/jpeg")}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "data" in data
        assert "gemini_classificatie" in data["data"]
    
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