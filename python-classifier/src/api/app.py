"""FastAPI Application Instance"""

from fastapi import FastAPI

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
