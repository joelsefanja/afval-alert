"""Info Endpoints"""

from typing import Any, Dict

from ..app import app


@app.get("/")
async def basis_info() -> Dict[str, Any]:
    """Service informatie in het Nederlands"""
    return {
        "service": "AfvalAlert Nederlandse Afval Classificatie",
        "versie": "3.0.0",
        "pipeline": "afbeelding → ConvNeXt Base model → Gemini AI → classificatie",
        "technologie": ["Singleton", "Factory", "Functional", "Decorators"],
        "beschikbare_endpoints": ["/classificeer", "/status", "/debug", "/docs"],
        "status": "actief en klaar voor gebruik"
    }
