"""
Test file for the new classifier implementation.
"""

import unittest
from unittest.mock import patch, MagicMock
from src.core.classifier import AfvalClassifier
from src.models.schemas import LocalClassification, ClassificationResult


class TestAfvalClassifier(unittest.TestCase):
    """Test cases for AfvalClassifier."""
    
    def setUp(self):
        """Set up test fixtures."""
        with patch('src.core.classifier.SwinConvNeXtClassifier.get_instance'), \
             patch('src.core.classifier.MockGeminiAI'):
            self.classifier = AfvalClassifier()
            
        # Use the predefined list to ensure we only use allowed categories
        self.classifier.afval_typen = [
            "Grofvuil", "Restafval", "Glas", "Papier en karton",
            "Organisch", "Textiel", "Elektronisch afval", 
            "Bouw- en sloopafval", "Chemisch afval", "Overig", "Geen afval"
        ]
    
    def test_combineer_resultaten(self):
        """Test combining local and Gemini results."""
        # Mock local results
        local_result = LocalClassification(
            success=True,
            predictions=[
                ClassificationResult('Glas', 0.85),
                ClassificationResult('Textiel', 0.10)
            ],
            max_confidence=0.85
        )
        
        # Mock Gemini results
        gemini_result = MagicMock()
        gemini_result.afval_types = [
            {'afval_type': 'Glas', 'zekerheid': 0.90},
            {'afval_type': 'Elektronisch afval', 'zekerheid': 0.75}
        ]
        
        # Test combining results
        results = self.classifier._combineer_resultaten(local_result, gemini_result)
        
        # Verify results structure
        self.assertIsInstance(results, list)
        self.assertGreater(len(results), 0)
        
        # Verify that Glas has the higher confidence (0.90 from Gemini)
        glas_result = next((r for r in results if r['afval_type'] == 'Glas'), None)
        self.assertIsNotNone(glas_result)
        self.assertEqual(glas_result['confidence'], 0.90)
        
        # Verify that Elektronisch afval is included
        elektronisch_result = next((r for r in results if r['afval_type'] == 'Elektronisch afval'), None)
        self.assertIsNotNone(elektronisch_result)
        self.assertEqual(elektronisch_result['confidence'], 0.75)
        
        # Verify results are sorted by confidence (highest first)
        confidences = [r['confidence'] for r in results]
        self.assertEqual(confidences, sorted(confidences, reverse=True))


if __name__ == '__main__':
    unittest.main()