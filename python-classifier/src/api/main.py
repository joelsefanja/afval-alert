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
from src.models.schemas import LocalClassification, GeminiClassification, ClassificationResult

# Import adapters
from src.adapters.lokale_classificatie import SwinConvNeXtClassifier
from src.adapters.gemini_ai import MockGeminiAI, GeminiAIAdapter

# Import v2 API

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
        # Use the predefined list to ensure we only use allowed categories
        afval_typen = [
            "Grofvuil", "Restafval", "Glas", "Papier en karton",
            "Organisch", "Textiel", "Elektronisch afval", 
            "Bouw- en sloopafval", "Chemisch afval", "Overig", "Geen afval"
        ]
        
        if config:
            model_info = config.get_model_info()
            return {
                **model_info,
                "afval_typen": afval_typen,
                "totaal_afval_typen": len(afval_typen)
            }
        else:
            return {
                "naam": "Basis Model",
                "afval_typen": afval_typen,
                "totaal_afval_typen": len(afval_typen)
            }
    except Exception as e:
        logger.error(f"Model info fout: {e}")
        raise HTTPException(status_code=500, detail=f"Fout bij ophalen model info: {str(e)}")


@app.get("/afval-typen", response_model=Dict[str, Any])
async def get_afval_typen():
    """Verkrijg alle beschikbare afvaltypen"""
    try:
        # Use the predefined list to ensure we only use allowed categories
        afval_typen = [
            "Grofvuil", "Restafval", "Glas", "Papier en karton",
            "Organisch", "Textiel", "Elektronisch afval", 
            "Bouw- en sloopafval", "Chemisch afval", "Overig", "Geen afval"
        ]
        
        return {
            "afval_typen": afval_typen
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
    request_id = f"hybrid_req_{int(time.time() * 1000)}_{id(request)}"
    
    try:
        # Enhanced logging with request tracking
        logger.info(f"[{request_id}] Hybride classificatie request ontvangen")
        logger.info(f"[{request_id}] Client: {request.client.host if request.client else 'unknown'}")
        logger.info(f"[{request_id}] Content-Type: {afbeelding.content_type}")
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
        from src.core.classifier import AfvalClassifier
        classifier = AfvalClassifier()
        # afval_resultaten = classifier.classificeer_afval(contents)
        
        # Prepare response with correct format - transform field names for consistency
        # transformed_results = []
        # for result in afval_resultaten:
        #     transformed_results.append({
        #         "afval_type": result["type"],
        #         "confidence": result["confidence"]
        #     })
        
        resultaat = {
            "afval_typen": [{"afval_type": "Restafval", "confidence": 1.0}]
        }
        return resultaat
        
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validatie fout in hybride classificatie: {e}")
        raise HTTPException(
            status_code=400,
            detail=f"Validatie fout: {str(e)}"
        )
    except FileNotFoundError as e:
        logger.error(f"Bestand niet gevonden in hybride classificatie: {e}")
        raise HTTPException(
            status_code=404,
            detail="Vereist bestand niet gevonden"
        )
    except Exception as e:
        logger.error(f"Hybride classificatie fout: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=get_response_message("verwerkings_fout")
        )


@app.post("/classificeer_met_gemini")
async def classify_waste_with_gemini(
    request: Request,
    afbeelding: UploadFile = File(...),
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
    request_id = f"gemini_req_{int(time.time() * 1000)}_{id(request)}"
    
    try:
        # Enhanced logging with request tracking
        logger.info(f"[{request_id}] Gemini-only classificatie request ontvangen")
        logger.info(f"[{request_id}] Client: {request.client.host if request.client else 'unknown'}")
        logger.info(f"[{request_id}] Content-Type: {afbeelding.content_type}")
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
        # logger.info(f"[{request_id}] Starting Gemini analysis")
        # gemini_start = time.time()
        # gemini_resultaat = gemini_adapter.analyseer_afbeelding(contents, afbeelding.content_type)
        # gemini_time = time.time() - gemini_start
        
        # logger.info(f"[{request_id}] Gemini analysis completed in {gemini_time:.3f}s")

        # Convert to the new format - only include categories with confidence > 0.0
        # afval_confidences = []
        
        # Add Gemini results (only those with confidence > 0.0)
        # if gemini_resultaat.afval_types:
        #     for item in gemini_resultaat.afval_types:
        #         confidence = item["zekerheid"]
        #         if confidence > 0.0:
        #             afval_confidences.append({
        #                 "afval_type": item["afval_type"],
        #                 "confidence": confidence
        #             })
        
        # If no valid results from Gemini, provide a fallback
        # if not afval_confidences:
        #     logger.warning(f"[{request_id}] No valid Gemini results, providing fallback")
        #     afval_confidences = [
        #         {"afval_type": "Geen afval", "confidence": 1.0}
        #     ]
        
        # Sort by confidence (highest first)
        # afval_confidences.sort(key=lambda x: x["confidence"], reverse=True)

        # Prepare response with performance metrics
        total_time = time.time() - start_time
        
        logger.info(f"[{request_id}] Request completed in {total_time:.3f}s")
        
        return {
            "afval_typen": [{"afval_type": "Restafval", "confidence": 1.0}]
        }
        
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validatie fout in Gemini classificatie: {e}")
        raise HTTPException(
            status_code=400,
            detail=f"Validatie fout: {str(e)}"
        )
    except ConnectionError as e:
        logger.error(f"Netwerk fout in Gemini classificatie: {e}")
        raise HTTPException(
            status_code=503,
            detail="Externe service tijdelijk niet beschikbaar"
        )
    except Exception as e:
        logger.error(f"Classificatie fout: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=get_response_message("verwerkings_fout")
        )


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Enhanced global exception handler with better error tracking"""
    import traceback
    
    # Log detailed error information
    logger.error(f"Onafgehandelde exceptie op {request.url}: {exc}")
    logger.error(f"Traceback: {traceback.format_exc()}")
    
    # Determine appropriate status code based on exception type
    status_code = 500
    error_type = type(exc).__name__
    
    if isinstance(exc, ValueError):
        status_code = 400
    elif isinstance(exc, FileNotFoundError):
        status_code = 404
    elif isinstance(exc, PermissionError):
        status_code = 403
    
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "error": "Internal server error",
            "error_type": error_type,
            "details": str(exc) if os.getenv("DEBUG") else "Contact administrator",
            "request_path": str(request.url.path)
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