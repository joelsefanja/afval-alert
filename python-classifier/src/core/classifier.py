"""
Core classifier module for AfvalAlert waste classification.

This module provides the main classification functionality that returns
all waste types with their confidence scores.
"""

from typing import List, Dict, Optional, Union
from src.models.schemas import ClassificationResult, LocalClassification, GeminiClassification
from src.adapters.lokale_classificatie import SwinConvNeXtClassifier
from src.adapters.gemini_ai import MockGeminiAI
from src.config.loader import get_configuration_service
import logging

logger = logging.getLogger(__name__)


class AfvalClassifier:
    """Main classifier that combines local and Gemini AI results."""
    
    def __init__(self):
        """Initialize classifier with adapters."""
        self.local_adapter = SwinConvNeXtClassifier.get_instance()
        self.gemini_adapter = MockGeminiAI()  # Using mock for now
        self.config_service = get_configuration_service()
        self.afval_typen = self._get_afval_typen()
    
    def _get_afval_typen(self) -> List[str]:
        """Get all afval types from configuration."""
        # Use the predefined list to ensure we only use allowed categories
        return [
            "Grofvuil", "Restafval", "Glas", "Papier en karton",
            "Organisch", "Textiel", "Elektronisch afval", 
            "Bouw- en sloopafval", "Chemisch afval", "Overig", "Geen afval"
        ]
    
    def classificeer_afval(self, image_data: bytes) -> List[Dict[str, float]]:
        """Classify waste and return all types with confidence scores."""
        try:
            # Validate input
            if not image_data or len(image_data) == 0:
                logger.warning("Empty image data received")
                raise ValueError("Empty image data provided")
            
            if len(image_data) > 50 * 1024 * 1024:  # 50MB limit
                raise ValueError("Image file too large (max 50MB)")
            
            # Get local classification results
            local_result = self.local_adapter.classificeer_afbeelding(image_data)
            
            if not local_result or not local_result.success:
                logger.warning("Local classification failed, using fallback")
                return self._get_fallback_results()
            
            # Get Gemini validation results
            local_description = self.local_adapter.krijg_tekst_beschrijving(local_result)
            local_predictions = [
                {"type": pred.class_name, "zekerheid": pred.probability}
                for pred in local_result.predictions[:3]
            ] if local_result.predictions else []
            
            try:
                gemini_result = self.gemini_adapter.valideer_lokale_resultaten(
                    local_description, local_predictions
                )
            except Exception as e:
                logger.warning(f"Gemini validation failed, using local results only: {e}")
                gemini_result = None
            
            # Combine results with confidence scores
            return self._combineer_resultaten(local_result, gemini_result)
            
        except ValueError:
            raise  # Re-raise validation errors
        except Exception as e:
            logger.error(f"Classification failed: {e}", exc_info=True)
            return self._get_fallback_results()
    
    def _combineer_resultaten(self, local_result, gemini_result) -> List[Dict[str, float]]:
        """Combine local and Gemini results into unified list."""
        # Start with all categories having 0 confidence
        afval_confidences = {
            afval_type: 0.0 for afval_type in self.afval_typen
        }
        
        # Add local predictions
        for pred in local_result.predictions:
            if pred.class_name in afval_confidences:
                afval_confidences[pred.class_name] = max(
                    afval_confidences[pred.class_name], 
                    pred.probability
                )
        
        # Add Gemini validated results
        if gemini_result.afval_types:
            for item in gemini_result.afval_types:
                afval_type = item["afval_type"]
                if afval_type in afval_confidences:
                    # Update confidence if Gemini's is higher
                    afval_confidences[afval_type] = max(
                        afval_confidences[afval_type], 
                        item["zekerheid"]
                    )
        
        # Convert to list format with correct naming - only include types with confidence > 0.0
        result = [
            {"type": afval_type, "confidence": confidence}
            for afval_type, confidence in afval_confidences.items()
            if confidence > 0.0
        ]
        
        # Sort by confidence (highest first)
        result.sort(key=lambda x: x["confidence"], reverse=True)
        
        # Ensure we have valid results
        if not result:
            logger.warning("No classification results generated, using fallback")
            return self._get_fallback_results()
        
        return result
    
    def _get_fallback_results(self) -> List[Dict[str, float]]:
        """Get fallback results when classification fails."""
        return [
            {"type": "Geen afval", "confidence": 1.0}
        ]