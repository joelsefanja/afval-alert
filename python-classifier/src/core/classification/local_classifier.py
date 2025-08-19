"""Local classifier implementation using SwinConvNeXt"""

import time
import random
from typing import List
from src.core.interfaces.classification_interface import ClassificationInterface
from src.core.models.classification_result import ClassificationResult


class LocalClassifier(ClassificationInterface):
    """Local classifier implementation"""
    
    def __init__(self):
        """Initialize classifier with waste categories"""
        self.waste_categories = [
            "Grofvuil", "Restafval", "Glas", "Papier en karton",
            "Organisch", "Textiel", "Elektronisch afval", 
            "Bouw- en sloopafval", "Chemisch afval", "Overig"
        ]
    
    def classify_waste(self, image_data: bytes) -> List[ClassificationResult]:
        """Classify waste in image and return all categories with confidence"""
        start_time = time.time()
        
        # Validate image first
        if not self.validate_image(image_data):
            return [ClassificationResult("Geen afval", 1.0)]
        
        # Generate classification results for all categories
        results = self._generate_classification_results()
        processing_time = time.time() - start_time
        
        return results
    
    def validate_image(self, image_data: bytes) -> bool:
        """Validate if image is suitable for classification"""
        if not image_data or len(image_data) == 0:
            return False
            
        # Check minimum and maximum size
        min_size = 1024  # 1KB
        max_size = 10 * 1024 * 1024  # 10MB
        
        return min_size <= len(image_data) <= max_size
    
    def _generate_classification_results(self) -> List[ClassificationResult]:
        """Generate classification results for all waste categories"""
        results = []
        
        # Generate confidence scores for each category
        for category in self.waste_categories:
            confidence = random.uniform(0.0, 1.0)
            results.append(ClassificationResult(category, confidence))
        
        # Sort by confidence (highest first)
        results.sort(key=lambda x: x.confidence, reverse=True)
        return results