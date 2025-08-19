"""
Unit tests for core classification logic
"""

import pytest
from unittest.mock import Mock, patch
import sys
from pathlib import Path

# Add src directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))

from src.core.classification import AfvalClassificatieRepository, ClassificatieService
from src.models.schemas import LocalClassification, ClassificationResult, GeminiClassification


class TestAfvalClassificatieRepository:
    """Test AfvalClassificatieRepository class"""

    def test_initialization(self):
        """Test repository initialization"""
        mock_lokale_adapter = Mock()
        mock_gemini_adapter = Mock()
        
        repo = AfvalClassificatieRepository(mock_lokale_adapter, mock_gemini_adapter)
        
        assert repo._lokale_adapter == mock_lokale_adapter
        assert repo._gemini_adapter == mock_gemini_adapter

    def test_classificeer_lokaal_success(self):
        """Test successful local classification"""
        mock_lokale_adapter = Mock()
        mock_gemini_adapter = Mock()
        repo = AfvalClassificatieRepository(mock_lokale_adapter, mock_gemini_adapter)
        
        # Setup mocks
        mock_lokale_adapter.valideer_afbeelding.return_value = True
        mock_result = LocalClassification(
            success=True,
            predictions=[ClassificationResult(class_name="plastic_flessen", probability=0.95)],
            max_confidence=0.95,
            processing_time=0.1
        )
        mock_lokale_adapter.classificeer_afbeelding.return_value = mock_result
        
        # Test
        result = repo.classificeer_lokaal(b"fake_image_data")
        
        # Assertions
        assert result == mock_result
        mock_lokale_adapter.valideer_afbeelding.assert_called_once_with(b"fake_image_data")
        mock_lokale_adapter.classificeer_afbeelding.assert_called_once_with(b"fake_image_data")

    def test_classificeer_lokaal_empty_data_raises_value_error(self):
        """Test that empty image data raises ValueError"""
        mock_lokale_adapter = Mock()
        mock_gemini_adapter = Mock()
        repo = AfvalClassificatieRepository(mock_lokale_adapter, mock_gemini_adapter)
        
        with pytest.raises(ValueError, match="Afbeelding data is leeg"):
            repo.classificeer_lokaal(b"")

    def test_classificeer_lokaal_invalid_image_raises_value_error(self):
        """Test that invalid image raises ValueError"""
        mock_lokale_adapter = Mock()
        mock_gemini_adapter = Mock()
        repo = AfvalClassificatieRepository(mock_lokale_adapter, mock_gemini_adapter)
        
        mock_lokale_adapter.valideer_afbeelding.return_value = False
        
        with pytest.raises(ValueError, match="Afbeelding is niet geldig voor classificatie"):
            repo.classificeer_lokaal(b"fake_image_data")

    def test_classificeer_gemini_success(self):
        """Test successful Gemini classification"""
        mock_lokale_adapter = Mock()
        mock_gemini_adapter = Mock()
        repo = AfvalClassificatieRepository(mock_lokale_adapter, mock_gemini_adapter)
        
        # Setup mocks
        mock_gemini_adapter.valideer_tekst.return_value = True
        mock_result = GeminiClassification(
            is_afval=True,
            afval_types=[{"afval_type": "plastic_flessen", "zekerheid": 0.9}],
            kenmerken=["plastic", "transparant"],
            bedank_boodschap="Bedankt voor je melding!"
        )
        mock_gemini_adapter.analyseer_tekst.return_value = mock_result
        
        # Test
        result = repo.classificeer_gemini("fake description")
        
        # Assertions
        assert result == mock_result
        mock_gemini_adapter.valideer_tekst.assert_called_once_with("fake description")
        mock_gemini_adapter.analyseer_tekst.assert_called_once_with("fake description")

    def test_classificeer_gemini_empty_description_raises_value_error(self):
        """Test that empty description raises ValueError"""
        mock_lokale_adapter = Mock()
        mock_gemini_adapter = Mock()
        repo = AfvalClassificatieRepository(mock_lokale_adapter, mock_gemini_adapter)
        
        with pytest.raises(ValueError, match="Beschrijving is leeg"):
            repo.classificeer_gemini("")

    def test_classificeer_gemini_whitespace_description_raises_value_error(self):
        """Test that whitespace-only description raises ValueError"""
        mock_lokale_adapter = Mock()
        mock_gemini_adapter = Mock()
        repo = AfvalClassificatieRepository(mock_lokale_adapter, mock_gemini_adapter)
        
        with pytest.raises(ValueError, match="Beschrijving is leeg"):
            repo.classificeer_gemini("   ")

    def test_classificeer_gemini_invalid_text_raises_value_error(self):
        """Test that invalid text raises ValueError"""
        mock_lokale_adapter = Mock()
        mock_gemini_adapter = Mock()
        repo = AfvalClassificatieRepository(mock_lokale_adapter, mock_gemini_adapter)
        
        mock_gemini_adapter.valideer_tekst.return_value = False
        
        with pytest.raises(ValueError, match="Beschrijving is niet geldig voor Gemini analyse"):
            repo.classificeer_gemini("fake description")

    def test_krijg_tekst_beschrijving(self):
        """Test getting text description from local result"""
        mock_lokale_adapter = Mock()
        mock_gemini_adapter = Mock()
        repo = AfvalClassificatieRepository(mock_lokale_adapter, mock_gemini_adapter)
        
        # Setup mocks
        mock_local_result = LocalClassification(
            success=True,
            predictions=[ClassificationResult(class_name="plastic_flessen", probability=0.95)],
            max_confidence=0.95,
            processing_time=0.1
        )
        mock_lokale_adapter.krijg_tekst_beschrijving.return_value = "Gedetecteerd: plastic_flessen (95.0%)"
        
        # Test
        result = repo.krijg_tekst_beschrijving(mock_local_result)
        
        # Assertions
        assert result == "Gedetecteerd: plastic_flessen (95.0%)"
        mock_lokale_adapter.krijg_tekst_beschrijving.assert_called_once_with(mock_local_result)

    def test_classificeer_volledig_success(self):
        """Test successful full classification"""
        mock_lokale_adapter = Mock()
        mock_gemini_adapter = Mock()
        repo = AfvalClassificatieRepository(mock_lokale_adapter, mock_gemini_adapter)
        
        # Setup mocks
        mock_lokale_adapter.valideer_afbeelding.return_value = True
        mock_local_result = LocalClassification(
            success=True,
            predictions=[ClassificationResult(class_name="plastic_flessen", probability=0.95)],
            max_confidence=0.95,
            processing_time=0.1
        )
        mock_lokale_adapter.classificeer_afbeelding.return_value = mock_local_result
        mock_lokale_adapter.krijg_tekst_beschrijving.return_value = "Gedetecteerd: plastic_flessen (95.0%)"
        
        mock_gemini_adapter.valideer_tekst.return_value = True
        mock_gemini_result = GeminiClassification(
            is_afval=True,
            afval_types=[{"afval_type": "plastic_flessen", "zekerheid": 0.9}],
            kenmerken=["plastic", "transparant"],
            bedank_boodschap="Bedankt voor je melding!"
        )
        mock_gemini_adapter.analyseer_tekst.return_value = mock_gemini_result
        
        # Test
        local_result, gemini_result = repo.classificeer_volledig(b"fake_image_data")
        
        # Assertions
        assert local_result == mock_local_result
        assert gemini_result == mock_gemini_result

    def test_classificeer_volledig_local_failure(self):
        """Test full classification when local classification fails"""
        mock_lokale_adapter = Mock()
        mock_gemini_adapter = Mock()
        repo = AfvalClassificatieRepository(mock_lokale_adapter, mock_gemini_adapter)
        
        # Setup mocks to simulate local classification failure
        mock_lokale_adapter.valideer_afbeelding.return_value = True
        mock_lokale_adapter.classificeer_afbeelding.side_effect = Exception("Local classification failed")
        
        # Test
        local_result, gemini_result = repo.classificeer_volledig(b"fake_image_data")
        
        # Assertions
        assert local_result.success == False
        assert local_result.predictions == []
        assert local_result.max_confidence == 0.0
        assert gemini_result is None

    def test_classificeer_volledig_gemini_failure(self):
        """Test full classification when Gemini classification fails"""
        mock_lokale_adapter = Mock()
        mock_gemini_adapter = Mock()
        repo = AfvalClassificatieRepository(mock_lokale_adapter, mock_gemini_adapter)
        
        # Setup mocks
        mock_lokale_adapter.valideer_afbeelding.return_value = True
        mock_local_result = LocalClassification(
            success=True,
            predictions=[ClassificationResult(class_name="plastic_flessen", probability=0.95)],
            max_confidence=0.95,
            processing_time=0.1
        )
        mock_lokale_adapter.classificeer_afbeelding.return_value = mock_local_result
        mock_lokale_adapter.krijg_tekst_beschrijving.return_value = "Gedetecteerd: plastic_flessen (95.0%)"
        
        # Simulate Gemini failure
        mock_gemini_adapter.valideer_tekst.return_value = True
        mock_gemini_adapter.analyseer_tekst.side_effect = Exception("Gemini classification failed")
        
        # Test
        local_result, gemini_result = repo.classificeer_volledig(b"fake_image_data")
        
        # Assertions
        assert local_result == mock_local_result
        assert gemini_result is None


if __name__ == "__main__":
    pytest.main([__file__, "-v"])