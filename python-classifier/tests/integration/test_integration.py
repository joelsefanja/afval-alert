"""
Integration Tests voor AfvalAlert Classificatie
Test de volledige workflow van configuratie tot classificatie
"""

import pytest
import sys
from pathlib import Path

# Voeg src directory toe aan path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))

from afval_alert.config.loader import get_configuration_service
from afval_alert.models.schemas import ClassificationResult, LocalClassification, GeminiClassification


class TestIntegration:
    """Integration tests voor het complete systeem"""

    def test_configuration_loading_integration(self):
        """Test dat configuratie correct wordt geladen"""
        # Test getting the configuration service
        config_service = get_configuration_service()
        
        # Test that we can get waste types
        waste_types = config_service.get_waste_type_names()
        assert isinstance(waste_types, list)
        
        # Test that we can get API defaults
        api_defaults = config_service.get_api_defaults()
        assert isinstance(api_defaults, dict)
        
        # Test that we can validate waste types
        if waste_types:
            first_waste_type = waste_types[0]
            is_valid = config_service.is_valid_waste_type(first_waste_type)
            assert is_valid is True

    def test_model_schemas_integration(self):
        """Test dat model schemas correct werken"""
        # Test ClassificationResult
        result = ClassificationResult("plastic_flessen", 0.85)
        assert result.class_name == "plastic_flessen"
        assert result.probability == 0.85
        
        # Test LocalClassification
        predictions = [ClassificationResult("plastic_flessen", 0.9)]
        local_classification = LocalClassification(True, predictions, 0.9)
        assert local_classification.success is True
        assert len(local_classification.predictions) == 1
        assert local_classification.max_confidence == 0.9
        
        # Test GeminiClassification
        from afval_alert.models.schemas import AfvalTypeZekerheid
        gemini = GeminiClassification(
            is_afval=True,
            afval_types=[AfvalTypeZekerheid("plastic_flessen", 0.8)],
            kenmerken=["plastic"],
            bedank_boodschap="Bedankt!"
        )
        assert gemini.is_afval is True
        assert gemini.afval_types[0].afval_type == "plastic_flessen"
        assert gemini.afval_types[0].zekerheid == 0.8
        assert gemini.kenmerken == ["plastic"]
        assert gemini.bedank_boodschap == "Bedankt!"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])