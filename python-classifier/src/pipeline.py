"""Functional Pipeline - Compose classificatie als pure functies"""

from typing import Any, Callable, Dict, List, TypeVar

from .decorators.logging_decorator import logged
from .exceptions.service_exceptions import ServiceNotAvailableError
from .services.service_factory import ServiceFactory

# Type voor pipeline functies
T = TypeVar("T")
PipelineFunc = Callable[[T], T]

# ======================== PIPELINE FUNCTIES ========================


def validate_services() -> None:
    """Controleer of alle services beschikbaar zijn"""
    factory = ServiceFactory()
    services = factory.create_all_services()

    if not services["lokaal"].is_ready():
        raise ServiceNotAvailableError("Lokale service niet beschikbaar")

    if not services["gemini"].is_ready():
        raise ServiceNotAvailableError("Gemini service niet beschikbaar")


@logged
def extract_swin_features(afbeelding_bytes: bytes) -> dict:
    """Stap 1: Extract Swin Tiny features"""
    factory = ServiceFactory()
    lokale_service = factory.create_lokale_service()
    features = lokale_service.extract_features(afbeelding_bytes)

    return {"afbeelding_bytes": afbeelding_bytes, "swin_features": features}


@logged
def classify_with_gemini(pipeline_data: dict) -> List[Dict[str, Any]]:
    """Stap 2: Classificeer met Gemini"""
    factory = ServiceFactory()
    gemini_service = factory.create_gemini_service()
    return gemini_service.classify(pipeline_data["swin_features"])


# ======================== PIPELINE COMPOSITION ========================


def compose(*functions: PipelineFunc) -> PipelineFunc:
    """Compose functies tot pipeline"""

    def composed_function(data):
        result = data
        for func in functions:
            result = func(result)
        return result

    return composed_function


# Pre-configured pipelines
# Minimal pipeline: always to service first, then to Gemini
classification_pipeline = compose(extract_swin_features, classify_with_gemini)

# ======================== MAIN PIPELINE EXECUTOR ========================


@logged
def execute_classification(afbeelding_bytes: bytes) -> List[Dict[str, Any]]:
    """
    Voer volledige classificatie pipeline uit

    Minimale pipeline: altijd eerst naar de service, daarna naar Gemini

    Args:
        afbeelding_bytes: Raw afbeelding data

    Returns:
        List[Dict]: [{"type": "...", "confidence": 0.xx}]

    Raises:
        ValidationError: Ongeldige input
        ServiceNotAvailableError: Service problemen
    """
    # Pre-validatie
    validate_services()

    # Voer pipeline uit - altijd eerst naar service, dan naar Gemini
    return classification_pipeline(afbeelding_bytes)


# ======================== PIPELINE UTILITIES ========================


def create_custom_pipeline(*steps: PipelineFunc) -> PipelineFunc:
    """Maak custom pipeline met eigen stappen"""
    return compose(*steps)


def add_pipeline_step(pipeline: PipelineFunc, step: PipelineFunc) -> PipelineFunc:
    """Voeg stap toe aan bestaande pipeline"""
    return compose(pipeline, step)


# Voor debugging/monitoring
@logged
def debug_pipeline(afbeelding_bytes: bytes) -> Dict[str, Any]:
    """Pipeline met debug informatie"""
    try:
        validate_services()
        step1_result = extract_swin_features(afbeelding_bytes)
        step2_result = classify_with_gemini(step1_result)

        return {
            "success": True,
            "swin_shape": str(step1_result["swin_features"].shape),
            "classifications": step2_result,
            "count": len(step2_result),
        }
    except Exception as e:
        return {"success": False, "error": str(e), "error_type": type(e).__name__}
