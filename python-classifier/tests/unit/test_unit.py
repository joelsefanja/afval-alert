import pytest
import sys
from pathlib import Path
from unittest.mock import Mock, patch

# Voeg src directory toe aan path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))

from src.models.schemas import ClassificationResult, LocalClassification, GeminiClassification

class TestModels:
    def test_classification_result(self):
        """Test ClassificationResult dataclass"""
        result = ClassificationResult("fles", 0.85)
        assert result.class_name == "fles"
        assert result.probability == 0.85
    
    def test_local_classification(self):
        """Test LocalClassification dataclass"""
        predictions = [ClassificationResult("fles", 0.9)]
        classification = LocalClassification(True, predictions, 0.9)
        assert classification.success is True
        assert len(classification.predictions) == 1
        assert classification.max_confidence == 0.9
    
    def test_gemini_classification(self):
        """Test GeminiClassification dataclass"""
        gemini = GeminiClassification(
            is_afval=True,
            afval_types=[{"afval_type": "plastic_flessen", "zekerheid": 0.8}],
            kenmerken=["plastic"],
            bedank_boodschap="Bedankt!"
        )
        assert gemini.is_afval is True
        assert gemini.afval_types[0]["afval_type"] == "plastic_flessen"
        assert gemini.afval_types[0]["zekerheid"] == 0.8
        assert gemini.kenmerken == ["plastic"]
        assert gemini.bedank_boodschap == "Bedankt!"

if __name__ == "__main__":
    pytest.main([__file__, "-v"])