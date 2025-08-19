"""Classification interface for SOLID architecture"""

from abc import ABC, abstractmethod
from typing import List, Tuple
from src.core.models.classification_result import ClassificationResult


class ClassificationInterface(ABC):
    """Abstract interface for classification services"""
    
    @abstractmethod
    def classify_waste(self, image_data: bytes) -> List[ClassificationResult]:
        """Classify waste in image and return all categories with confidence
        
        Args:
            image_data: Image bytes to classify
            
        Returns:
            List of all waste categories with their confidence scores
        """
        pass
    
    @abstractmethod
    def validate_image(self, image_data: bytes) -> bool:
        """Validate if image is suitable for classification
        
        Args:
            image_data: Image bytes to validate
            
        Returns:
            True if image is valid for classification
        """
        pass