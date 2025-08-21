"""Unit tests for pipeline module"""

import pytest
from unittest.mock import patch, MagicMock
import torch

from src.pipeline import (
    extract_swin_features,
    classify_with_gemini,
    execute_classification,
    classification_pipeline,
    validate_services
)
from src.utils import ServiceNotAvailableError


class TestPipeline:
    """Unit tests for pipeline functions"""

    def test_classification_pipeline_composition(self):
        """Test that classification pipeline is composed correctly"""
        # Check that the pipeline is composed of the right functions
        assert classification_pipeline is not None
        
    @patch('src.pipeline.factory')
    def test_validate_services_success(self, mock_factory):
        """Test service validation succeeds when all services are ready"""
        # Setup mock services
        mock_lokal_service = MagicMock()
        mock_lokal_service.is_ready.return_value = True
        mock_gemini_service = MagicMock()
        mock_gemini_service.is_ready.return_value = True
        
        mock_factory.create_all_services.return_value = {
            "lokaal": mock_lokal_service,
            "gemini": mock_gemini_service
        }
        
        # Should not raise any exception
        validate_services()
        
    @patch('src.pipeline.factory')
    def test_validate_services_local_not_ready(self, mock_factory):
        """Test service validation fails when local service is not ready"""
        # Setup mock services
        mock_lokal_service = MagicMock()
        mock_lokal_service.is_ready.return_value = False
        mock_gemini_service = MagicMock()
        mock_gemini_service.is_ready.return_value = True
        
        mock_factory.create_all_services.return_value = {
            "lokaal": mock_lokal_service,
            "gemini": mock_gemini_service
        }
        
        # Should raise ServiceNotAvailableError
        with pytest.raises(ServiceNotAvailableError, match="Lokale service niet beschikbaar"):
            validate_services()
            
    @patch('src.pipeline.factory')
    def test_validate_services_gemini_not_ready(self, mock_factory):
        """Test service validation fails when Gemini service is not ready"""
        # Setup mock services
        mock_lokal_service = MagicMock()
        mock_lokal_service.is_ready.return_value = True
        mock_gemini_service = MagicMock()
        mock_gemini_service.is_ready.return_value = False
        
        mock_factory.create_all_services.return_value = {
            "lokaal": mock_lokal_service,
            "gemini": mock_gemini_service
        }
        
        # Should raise ServiceNotAvailableError
        with pytest.raises(ServiceNotAvailableError, match="Gemini service niet beschikbaar"):
            validate_services()

    @patch('src.pipeline.factory')
    def test_extract_swin_features(self, mock_factory):
        """Test feature extraction step"""
        # Setup mock data
        test_bytes = b"fake_image_data"
        mock_tensor = torch.randn(1, 3, 224, 224)
        
        # Setup mock service
        mock_lokal_service = MagicMock()
        mock_lokal_service.extract_features.return_value = mock_tensor
        mock_factory.create_lokale_service.return_value = mock_lokal_service
        
        # Execute function
        result = extract_swin_features(test_bytes)
        
        # Verify results
        assert "afbeelding_bytes" in result
        assert "swin_features" in result
        assert result["afbeelding_bytes"] == test_bytes
        assert result["swin_features"] is mock_tensor
        mock_lokal_service.extract_features.assert_called_once_with(test_bytes)
        
    @patch('src.pipeline.factory')
    def test_classify_with_gemini(self, mock_factory):
        """Test Gemini classification step"""
        # Setup mock data
        mock_tensor = torch.randn(1, 3, 224, 224)
        test_data = {"afbeelding_bytes": b"fake_data", "swin_features": mock_tensor}
        mock_result = [{"type": "Restafval", "confidence": 0.95}]
        
        # Setup mock service
        mock_gemini_service = MagicMock()
        mock_gemini_service.classify.return_value = mock_result
        mock_factory.create_gemini_service.return_value = mock_gemini_service
        
        # Execute function
        result = classify_with_gemini(test_data)
        
        # Verify results
        assert result == mock_result
        mock_gemini_service.classify.assert_called_once_with(mock_tensor)