import sys
"""
FastAPI applicatie voor AfvalAlert zwerfafval classificatie

Deze module bevat de hoofdapplicatie met alle REST API endpoints
voor het classificeren van zwerfafval met AI modellen.
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import time
import os
from typing import Dict, Any
import logging
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Import core components
from src.config.loader import get_configuration_service
from src.config.categories import AFVAL_CATEGORIEEN
from src.models.schemas import LocalClassification, GeminiClassification, ClassificationResult

# Import adapters
from src.adapters.lokale_classificatie import SwinConvNeXtClassifier
from src.adapters.gemini_ai import MockGeminiAI, GeminiAIAdapter

# Import v2 API
from src.api.v2 import router as v2_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="AfvalAlert - Afval Classificatie",
    description="Nederlandse afvalclassificatie service",
    version="2.0.0",
    docs_url="/documentatie",
    redoc_url="/documentatie-rood"
)

# Include v2 API router
app.include_router(v2_router)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global configuration
try:
    config = get_configuration_service()
    logger.info("Configuratie succesvol geladen")
except Exception as e:
    logger.error(f"Fout bij laden van configuratie: {e}")
    config = None


def get_api_defaults():
    """Verkrijg API standaardinstellingen"""
    if config:
        constants = config.get_constants()
        return constants.get('api_standaarden', {})
    return {}


def get_response_message(message_key, **kwargs):
    """Verkrijg geformatteerd responsbericht"""
    if config:
        constants = config.get_constants()
        messages = constants.get('response_berichten', {})
        message = messages.get(message_key, f"Onbekend bericht: {message_key}")
        
        try:
            return message.format(**kwargs)
        except KeyError as e:
            logger.error(f"Ontbrekende formatparameter voor bericht {message_key}: {e}")
            return message
    return f"Onbekend bericht: {message_key}"


# Initialize adapters
try:
    # Initialiseer SwinConvNeXt adapter (Enhanced Swin Transformer + ConvNeXt)
    lokale_adapter = SwinConvNeXtClassifier.get_instance()
    logger.info("SwinConvNeXt model geïnitialiseerd (biedt gemiddeld 98.97% accuracy)")
    
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if gemini_api_key:
        gemini_adapter = GeminiAIAdapter(gemini_api_key=gemini_api_key)
        logger.info("Gebruik Gemini AI API")
    else:
        gemini_adapter = MockGeminiAI()
        logger.info("Gebruik mock Gemini AI (geen API key gevonden)")
        
except Exception as e:
    logger.error(f"Fout bij initialiseren van adapters: {e}")
    # Fallback naar SwinConvNeXt en mock Gemini
    lokale_adapter = SwinConvNeXtClassifier.get_instance()
    gemini_adapter = MockGeminiAI()
    logger.warning("Fallback: SwinConvNeXt + Mock Gemini geactiveerd")


@app.get("/")
async def root():
    """Root endpoint met service informatie"""
    if config:
        service_info = config.get_service_info()
        model_info = config.get_model_info()
        performance_settings = config.get_performance_settings()
    else:
        service_info = {"naam": "AfvalAlert Classificatie", "versie": "2.0.0"}
        model_info = {"naam": "Basis Model", "prestaties": {}}
        performance_settings = {}
    
    return {
        "service": service_info.get("naam", "AfvalAlert Classificatie"),
        "versie": service_info.get("versie", "2.0.0"),
        "model": model_info.get("naam", "Basis Model"),
        "status": "actief",
        "endpoints": [
            "/classificeer",
            "/classificeer_met_gemini",
            "/model-info", 
            "/gezondheid",
            "/afval-typen",
            "/documentatie"
        ],
        "prestatie_instellingen": performance_settings
    }


@app.get("/gezondheid")
async def health_check():
    """Gezondheid check endpoint"""
    try:
        config_status = config is not None
        
        return {
            "status": "gezond" if config_status else "verminderd",
            "configuratie_geladen": config_status,
            "tijdstip": time.time(),
            "service": config.get_service_info().get("naam", "AfvalAlert") if config else "AfvalAlert"
        }
    except Exception as e:
        logger.error(f"Gezondheid check fout: {e}")
        return {
            "status": "ziek",
            "fout": str(e),
            "tijdstip": time.time()
        }


@app.get("/model-info")
async def model_info():
    """Model informatie endpoint"""
    try:
        if config:
            model_info = config.get_model_info()
            return {
                **model_info,
                "categorieën": list(AFVAL_CATEGORIEEN.keys()),
                "totaal_categorieën": len(AFVAL_CATEGORIEEN)
            }
        else:
            return {
                "naam": "Basis Model",
                "categorieën": list(AFVAL_CATEGORIEEN.keys()),
                "totaal_categorieën": len(AFVAL_CATEGORIEEN)
            }
    except Exception as e:
        logger.error(f"Model info fout: {e}")
        raise HTTPException(status_code=500, detail=f"Fout bij ophalen model info: {str(e)}")


@app.get("/afval-typen", response_model=Dict[str, Any])
async def get_waste_types():
    """Verkrijg alle beschikbare afvaltypen uit configuratie"""
    try:
        categories = list(AFVAL_CATEGORIEEN.keys())
        
        # Verkrijg gedetailleerde informatie voor elk type
        type_info = {}
        for category in categories:
            info = AFVAL_CATEGORIEEN.get(category, {})
            type_info[category] = {
                "naam": info.get("name", category),
                "beschrijving": info.get("description", ""),
                "service_type": info.get("service_type", ""),
                "urgentie": info.get("urgency", ""),
                "recycling_info": info.get("recycling_info", "")
            }
        
        return {
            "status": "success",
            "data": {
                'afval_typen': type_info,
                "totaal": len(categories)
            },
            "tijdstip": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Fout bij ophalen afvaltypen: {e}")
        raise HTTPException(
            status_code=500, 
            detail=get_response_message("configuratie_fout")
        )


@app.post("/classificeer")
async def classify_waste_hybrid(
    request: Request,
    afbeelding: UploadFile = File(...),
    top_k: int = 3,
    betrouwbaarheid_drempel: float = 0.5
):
    """
    Classificeer zwerfafval afbeelding met hybride approach (lokaal + Gemini validatie)
    
    Efficiente werkwijze:
    1. Lokaal AI model analyseert de afbeelding (snel, lokaal)
    2. Gemini AI valideert lokale resultaten (text-only, geen foto verzonden)
    3. Combinatie van beide resultaten voor beste accuracy
    """
    start_time = time.time()
    
    try:
        logging.info(f"Incoming request: {request}")
        # Validate file type
        if not afbeelding.content_type.startswith('image/'):
            raise HTTPException(
                status_code=400,
                detail=get_response_message("ongeldig_formaat")
            )
        
        # Validate file size
        contents = await afbeelding.read()
        logging.info(f"File size: {len(contents)}")
        max_size = get_api_defaults().get('max_bestand_grootte_mb', 50) * 1024 * 1024
        logging.info(f"Max file size: {max_size}")
        if len(contents) > max_size:
            raise HTTPException(
                status_code=413,
                detail=get_response_message("bestand_te_groot", max_size=max_size//1024//1024)
            )
        
        # Reset file pointer for processing
        await afbeelding.seek(0)
        
        # Use the new classifier for consistent results
        from src.core.classifier import WasteClassifier
        classifier = WasteClassifier()
        category_confidences = classifier.classify_waste(contents)
        
        # Prepare response
        simplified_result = {
            "status": "success",
            "data": category_confidences,
            "timestamp": datetime.now().isoformat()
        }
        return simplified_result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Hybride classificatie fout: {e}")
        raise HTTPException(
            status_code=500,
            detail=get_response_message("verwerkings_fout")
        )


@app.post("/classificeer_met_gemini")
async def classify_waste_with_gemini(
    request: Request,
    afbeelding: UploadFile = File(...),
    top_k: int = 3,
    betrouwbaarheid_drempel: float = 0.5
):
    """
    Classificeer zwerfafval afbeelding direct met Gemini Vision API
    
    Direct approach:
    1. Afbeelding wordt direct naar Gemini Vision API gestuurd
    2. Gemini analyseert de foto zelf zonder voorkennis
    3. Meest accurate maar ook duurste optie
    """
    start_time = time.time()
    
    try:
        logging.info(f"Incoming request: {request}")
        # Validate file type
        if not afbeelding.content_type.startswith('image/'):
            raise HTTPException(
                status_code=400,
                detail=get_response_message("ongeldig_formaat")
            )
        
        # Validate file size
        contents = await afbeelding.read()
        max_size = get_api_defaults().get('max_bestand_grootte_mb', 50) * 1024 * 1024
        if len(contents) > max_size:
            raise HTTPException(
                status_code=413,
                detail=get_response_message("bestand_te_groot", max_size=max_size//1024//1024)
            )
        
        # Reset file pointer for processing
        await afbeelding.seek(0)
        
        # Process image directly with Gemini AI
        gemini_resultaat = gemini_adapter.analyseer_afbeelding(contents, afbeelding.content_type)

        # Convert to the new format with all categories
        from src.core.classifier import WasteClassifier
        classifier = WasteClassifier()
        all_categories = classifier.afval_categories
        
        # Create result with all categories
        category_confidences = []
        
        # Add Gemini results
        if gemini_resultaat.afval_types:
            for item in gemini_resultaat.afval_types:
                category_confidences.append({
                    "type": item["afval_type"],
                    "confidence": item["zekerheid"]
                })
        
        # Add remaining categories with 0 confidence
        gemini_types = [item["afval_type"] for item in gemini_resultaat.afval_types] if gemini_resultaat.afval_types else []
        for category in all_categories:
            if category not in gemini_types:
                category_confidences.append({
                    "type": category,
                    "confidence": 0.0
                })
        
        # Sort by confidence (highest first)
        category_confidences.sort(key=lambda x: x["confidence"], reverse=True)

        # Prepare response
        verwerkingstijd = time.time() - start_time
        
        return {
            "status": "success",
            "data": category_confidences,
            "tijdstip": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Classificatie fout: {e}")
        raise HTTPException(
            status_code=500,
            detail=get_response_message("verwerkings_fout")
        )


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Onafgehandelde exceptie: {exc}")
    
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "details": str(exc) if os.getenv("DEBUG") else "Contact administrator",
            "timestamp": time.time()
        }
    )


def main():
    """Hoofd applicatie entry point"""
    try:
        host = os.getenv("HOST", "0.0.0.0")
        default_port = 8000
        port = int(os.getenv("PORT", default_port))
        
        logger.info(f"Starten AfvalAlert Classificatie op {host}:{port}")
        print(f"Python sys.path: {sys.path}")
        print(f"Current working directory: {os.getcwd()}")
        logger.info(f"Uvicorn binding to: {host}:{port}")
        uvicorn.run(
            "src.api.main:app",
            host=host,
            port=port,
            reload=False,
            log_level="info"
        )
    except Exception as e:
        logger.error(f"Fout bij starten AfvalAlert: {e}")
        raise


if __name__ == "__main__":
    main()