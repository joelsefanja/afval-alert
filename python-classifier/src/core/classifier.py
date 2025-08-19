"""
Core classifier module for AfvalAlert waste classification.

This module provides the main classification functionality that returns
all waste types with their confidence scores.
"""

from typing import List, Dict
from src.models.schemas import ClassificationResult
from src.adapters.lokale_classificatie import SwinConvNeXtClassifier
from src.adapters.gemini_ai import MockGeminiAI
from src.config.loader import get_configuration_service
import logging

logger = logging.getLogger(__name__)


class WasteClassifier:
    """Main classifier that combines local and Gemini AI results."""
    
    def __init__(self):
        """Initialize classifier with adapters."""
        self.local_adapter = SwinConvNeXtClassifier.get_instance()
        self.gemini_adapter = MockGeminiAI()  # Using mock for now
        self.config_service = get_configuration_service()
        self.afval_categories = self._get_all_waste_categories()
    
    def _get_all_waste_categories(self) -> List[str]:
        """Get all waste categories from configuration."""
        categories = self.config_service.get_waste_categories()
        return list(categories.keys())
    
    def classify_waste(self, image_data: bytes) -> List[Dict[str, float]]:
        """Classify waste and return all types with confidence scores."""
        # Get local classification results
        local_result = self.local_adapter.classificeer_afbeelding(image_data)
        
        # Get Gemini validation results
        local_description = self.local_adapter.krijg_tekst_beschrijving(local_result)
        local_predictions = [
            {"type": pred.class_name, "zekerheid": pred.probability}
            for pred in local_result.predictions[:3]
        ] if local_result.predictions else []
        
        gemini_result = self.gemini_adapter.valideer_lokale_resultaten(
            local_description, local_predictions
        )
        
        # Combine results with confidence scores
        return self._combine_results(local_result, gemini_result)
    
    def _combine_results(self, local_result, gemini_result) -> List[Dict[str, float]]:
        """Combine local and Gemini results into unified list."""
        # Start with all categories having 0 confidence
        category_confidences = {
            category: 0.0 for category in self.afval_categories
        }
        
        # Add local predictions
        for pred in local_result.predictions:
            if pred.class_name in category_confidences:
                category_confidences[pred.class_name] = max(
                    category_confidences[pred.class_name], 
                    pred.probability
                )
        
        # Add Gemini validated results
        if gemini_result.afval_types:
            for item in gemini_result.afval_types:
                afval_type = item["afval_type"]
                if afval_type in category_confidences:
                    # Update confidence if Gemini's is higher
                    category_confidences[afval_type] = max(
                        category_confidences[afval_type], 
                        item["zekerheid"]
                    )
        
        # Convert to list format
        result = [
            {"type": category, "confidence": confidence}
            for category, confidence in category_confidences.items()
        ]
        
        # Sort by confidence (highest first)
        result.sort(key=lambda x: x["confidence"], reverse=True)
        return result