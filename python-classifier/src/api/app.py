"""FastAPI Application Instance"""

from fastapi import FastAPI
from ..services.service_factory import ServiceFactory

app = FastAPI(
    title="AfvalAlert - Nederlandse Afval Classificatie",
    description="Ultra-compacte afval classificatie met Swin Tiny + Gemini AI",
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    contact={
        "name": "AfvalAlert Team",
        "email": "team@afvalalert.nl",
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
)

@app.on_event("startup")
async def startup_event():
    """Controleer bij opstarten of de Gemini service klaar is."""
    print("Checking Gemini service readiness...")
    service_factory = ServiceFactory()
    gemini_service = service_factory.create_gemini_service()
    if gemini_service.is_ready():
        print("Gemini service is ready.")
    else:
        print("Gemini service is not ready. Check configuration.")
