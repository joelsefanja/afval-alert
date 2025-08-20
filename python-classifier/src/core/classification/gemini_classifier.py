"""Gemini AI classifier implementation"""

import logging
from typing import List
from src.core.interfaces.classification_interface import ClassificationInterface
from src.core.models.classification_result import ClassificationResult

logger = logging.getLogger(__name__)


class GeminiClassifier(ClassificationInterface):
    """Gemini AI classifier implementation"""
    
    def __init__(self, api_key: str = None):
        """Initialize Gemini classifier"""
        self.api_key = api_key
        self.waste_categories = [
            "Grofvuil", "Restafval", "Glas", "Papier en karton",
            "Organisch", "Textiel", "Elektronisch afval", 
            "Bouw- en sloopafval", "Chemisch afval", "Overig", "Geen afval"
        ]
    
    def classify_waste(self, image_data: bytes) -> List[ClassificationResult]:
        """Classify waste using Gemini AI and return all categories with confidence"""
        # Validate image first
        if not self.validate_image(image_data):
            return [ClassificationResult("Geen afval", 1.0)]
        
        # In a real implementation, this would call the Gemini API
        # For now, we'll return mock results
        return self._get_mock_results()
    
    def validate_image(self, image_data: bytes) -> bool:
        """Validate if image is suitable for Gemini classification"""
        if not image_data or len(image_data) == 0:
            return False
            
        # Check minimum and maximum size for Gemini
        min_size = 1024  # 1KB
        max_size = 20 * 1024 * 1024  # 20MB (Gemini limit)
        
        return min_size <= len(image_data) <= max_size
    
    def _get_mock_results(self) -> List[ClassificationResult]:
        """Get mock classification results"""
        import random
        
        results = []
        for category in self.waste_categories:
            confidence = random.uniform(0.0, 1.0)
            results.append(ClassificationResult(category, confidence))
        
        # Sort by confidence (highest first)
        results.sort(key=lambda x: x.confidence, reverse=True)
        return results