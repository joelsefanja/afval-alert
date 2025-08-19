"""
Unit tests for lokale_classificatie adapter
"""

import pytest
from unittest.mock import Mock, patch
import sys
from pathlib import Path

# Add src directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))

from src.adapters.lokale_classificatie import SwinConvNeXtClassifier, LokaleClassificatieAdapter
from src.models.schemas import LocalClassification, ClassificationResult


class TestSwinConvNeXtClassifier:
    """Test SwinConvNeXtClassifier class"""

    def test_singleton_pattern(self):
        """Test that SwinConvNeXtClassifier follows singleton pattern"""
        instance1 = SwinConvNeXtClassifier.get_instance()
        instance2 = SwinConvNeXtClassifier.get_instance()
        
        assert instance1 is instance2

    def test_singleton_direct_instantiation_raises_exception(self):
        """Test that direct instantiation raises exception"""
        # First get the instance to initialize the singleton
        SwinConvNeXtClassifier.get_instance()
        
        with pytest.raises(Exception, match="SwinConvNeXtClassifier is a singleton class and cannot be instantiated directly."):
            SwinConvNeXtClassifier()

    def test_classificeer_afbeelding(self):
        """Test image classification"""
        classifier = SwinConvNeXtClassifier.get_instance()
        
        # Test with fake image data
        result = classifier.classificeer_afbeelding(b"fake_image_data")
        
        # Assertions
        assert isinstance(result, LocalClassification)
        assert result.success == True
        assert isinstance(result.predictions, list)
        assert len(result.predictions) > 0
        assert isinstance(result.max_confidence, float)
        assert 0.0 <= result.max_confidence <= 1.0
        assert isinstance(result.processing_time, float)
        assert result.processing_time > 0

    def test_krijg_tekst_beschrijving_success(self):
        """Test getting text description for successful classification"""
        classifier = SwinConvNeXtClassifier.get_instance()
        
        # Create a successful local classification result
        local_result = LocalClassification(
            success=True,
            predictions=[
                ClassificationResult(class_name="plastic_flessen", probability=0.95),
                ClassificationResult(class_name="blikjes", probability=0.15)
            ],
            max_confidence=0.95,
            processing_time=0.1
        )
        
        # Test
        description = classifier.krijg_tekst_beschrijving(local_result)
        
        # Assertions
        assert isinstance(description, str)
        assert "Gedetecteerd:" in description
        assert "plastic_flessen" in description
        assert "95.0%" in description

    def test_krijg_tekst_beschrijving_failure(self):
        """Test getting text description for failed classification"""
        classifier = SwinConvNeXtClassifier.get_instance()
        
        # Create a failed local classification result
        local_result = LocalClassification(
            success=False,
            predictions=[],
            max_confidence=0.0,
            processing_time=0.1
        )
        
        # Test
        description = classifier.krijg_tekst_beschrijving(local_result)
        
        # Assertions
        assert isinstance(description, str)
        assert "kon geen betrouwbare classificatie uitvoeren" in description

    def test_valideer_afbeelding_valid(self):
        """Test validating valid image"""
        classifier = SwinConvNeXtClassifier.get_instance()
        
        # Test with image data of valid size (5KB)
        valid_image_data = b"x" * 5120  # 5KB
        is_valid = classifier.valideer_afbeelding(valid_image_data)
        
        assert is_valid == True

    def test_valideer_afbeelding_empty(self):
        """Test validating empty image"""
        classifier = SwinConvNeXtClassifier.get_instance()
        
        # Test with empty image data
        is_valid = classifier.valideer_afbeelding(b"")
        
        assert is_valid == False

    def test_valideer_afbeelding_too_small(self):
        """Test validating image that's too small"""
        classifier = SwinConvNeXtClassifier.get_instance()
        
        # Test with image data smaller than minimum (500 bytes)
        small_image_data = b"x" * 500
        is_valid = classifier.valideer_afbeelding(small_image_data)
        
        assert is_valid == False

    def test_valideer_afbeelding_too_large(self):
        """Test validating image that's too large"""
        classifier = SwinConvNeXtClassifier.get_instance()
        
        # Test with image data larger than maximum (15MB)
        large_image_data = b"x" * (15 * 1024 * 1024)
        is_valid = classifier.valideer_afbeelding(large_image_data)
        
        assert is_valid == False


if __name__ == "__main__":
    pytest.main([__file__, "-v"])