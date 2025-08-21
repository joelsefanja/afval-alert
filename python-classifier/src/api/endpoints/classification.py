"""Classification Endpoints"""

from typing import Any, Dict, List

from fastapi import File, HTTPException, UploadFile
from pydantic import BaseModel, Field

from ...decorators.logging_decorator import logged
from ...exceptions.service_exceptions import ServiceNotAvailableError
from ...exceptions.validation_exceptions import ValidationError
from ...pipeline import debug_pipeline, execute_classification
from ..app import app


class ClassificationResponse(BaseModel):
    """Response model voor afval classificatie"""
    type: str = Field(..., description="Type afval (bijv. 'Grofvuil', 'Restafval', 'Glas', 'Papier en karton', 'Organisch', 'Textiel', 'Elektronisch afval', 'Bouw- en sloopafval', 'Chemisch afval', 'Overig', 'Geen afval')")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Betrouwbaarheidsscore tussen 0 en 1")


class DebugResponse(BaseModel):
    """Response model voor debug endpoint"""
    pipeline_steps: Dict[str, Any] = Field(..., description="Details van pipeline stappen")
    classification: List[ClassificationResponse] = Field(..., description="Classificatie resultaten")
    processing_time: float = Field(..., description="Verwerkingstijd in seconden")


@app.post("/classificeer")
@logged
async def classificeer_afval(
    afbeelding: UploadFile = File(...),
) -> List[ClassificationResponse]:
    """
    Ultra-compacte classificatie endpoint

    Upload: Alle image formaten (jpg, png, webp, gif, bmp, tiff)
    Output: [{"type": "Glas", "confidence": 0.95}]
    """
    # Basis validatie
    if not afbeelding.content_type or not afbeelding.content_type.startswith("image/"):
        raise HTTPException(400, "Alleen afbeeldingen toegestaan")

    # Lees data
    afbeelding_bytes = await afbeelding.read()

    try:
        # Voer pipeline uit (alle logica in pipeline module)
        resultaat = execute_classification(afbeelding_bytes)
        return resultaat

    except ValidationError as e:
        raise HTTPException(400, f"Validatie fout: {e}")
    except ServiceNotAvailableError as e:
        raise HTTPException(503, f"Service fout: {e}")
    except Exception as e:
        raise HTTPException(500, f"Pipeline fout: {e}")


@app.post("/debug")
async def debug_classificatie(afbeelding: UploadFile = File(...)) -> DebugResponse:
    """Debug endpoint met pipeline details"""
    if not afbeelding.content_type or not afbeelding.content_type.startswith("image/"):
        raise HTTPException(400, "Alleen afbeeldingen toegestaan")

    afbeelding_bytes = await afbeelding.read()
    return debug_pipeline(afbeelding_bytes)
