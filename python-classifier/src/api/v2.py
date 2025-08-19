"""
Simplified API endpoints for waste classification.

This module provides clean API endpoints that return all waste types
with their confidence scores without any filtering.
"""

from fastapi import APIRouter, File, UploadFile, HTTPException
from typing import List, Dict
import logging
from src.core.classifier import WasteClassifier

logger = logging.getLogger(__name__)

# Initialize router
router = APIRouter(prefix="/api/v2", tags=["classification"])

# Initialize classifier
classifier = WasteClassifier()


@router.post("/classify")
async def classify_waste(afbeelding: UploadFile = File(...)) -> Dict:
    """Classify waste and return all types with confidence scores."""
    try:
        # Validate file type
        if not afbeelding.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Ongeldig bestandsformaat")
        
        # Read image data
        contents = await afbeelding.read()
        
        # Validate file size (max 10MB)
        if len(contents) > 10 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="Bestand is te groot")
        
        # Classify waste
        results = classifier.classify_waste(contents)
        
        return {
            "status": "success",
            "data": results
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Classificatie fout: {e}")
        raise HTTPException(status_code=500, detail="Interne server fout")


@router.get("/waste-types")
async def get_waste_types() -> Dict:
    """Get all available waste types."""
    try:
        results = classifier.afval_categories
        return {
            "status": "success", 
            "data": results
        }
    except Exception as e:
        logger.error(f"Fout bij ophalen afvaltypen: {e}")
        raise HTTPException(status_code=500, detail="Interne server fout")