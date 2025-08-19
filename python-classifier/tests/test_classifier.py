"""
Test file for the new classifier implementation.
"""

import unittest
from unittest.mock import patch, MagicMock
from src.core.classifier import WasteClassifier
from src.models.schemas import LocalClassification, ClassificationResult


class TestWasteClassifier(unittest.TestCase):
    """Test cases for WasteClassifier."""
    
    def setUp(self):
        """Set up test fixtures."""
        with patch('src.core.classifier.SwinConvNeXtClassifier.get_instance'), \
             patch('src.core.classifier.MockGeminiAI'), \
             patch('src.core.classifier.get_configuration_service'):
            self.classifier = WasteClassifier()
            
        # Mock the configuration service
        self.classifier.afval_categories = [
            'plastic_flessen', 'blikjes', 'glazen_flessen', 
            'papier_karton', 'batterijen', 'elektronische_apparaten',
            'textiel', 'organisch', 'sigaretten', 'kauwgom',
            'niet_classificeerbaar', 'geen_zwerfafval'
        ]
    
    def test_combine_results(self):
        """Test combining local and Gemini results."""
        # Mock local results
        local_result = LocalClassification(
            success=True,
            predictions=[
                ClassificationResult('plastic_flessen', 0.85),
                ClassificationResult('blikjes', 0.10)
            ],
            max_confidence=0.85
        )
        
        # Mock Gemini results
        gemini_result = MagicMock()
        gemini_result.afval_types = [
            {'afval_type': 'plastic_flessen', 'zekerheid': 0.90},
            {'afval_type': 'batterijen', 'zekerheid': 0.75}
        ]
        
        # Test combining results
        results = self.classifier._combine_results(local_result, gemini_result)
        
        # Verify results structure
        self.assertIsInstance(results, list)
        self.assertGreater(len(results), 0)
        
        # Verify that plastic_flessen has the higher confidence (0.90 from Gemini)
        plastic_result = next((r for r in results if r['type'] == 'plastic_flessen'), None)
        self.assertIsNotNone(plastic_result)
        self.assertEqual(plastic_result['confidence'], 0.90)
        
        # Verify that batterijen is included
        battery_result = next((r for r in results if r['type'] == 'batterijen'), None)
        self.assertIsNotNone(battery_result)
        self.assertEqual(battery_result['confidence'], 0.75)
        
        # Verify results are sorted by confidence (highest first)
        confidences = [r['confidence'] for r in results]
        self.assertEqual(confidences, sorted(confidences, reverse=True))


if __name__ == '__main__':
    unittest.main()