"""Status Endpoints"""

from typing import Any, Dict

from ...services.service_factory import ServiceFactory
from ..app import app


@app.get("/status")
async def service_status() -> Dict[str, Any]:
    """Nederlandse status controle"""
    try:
        factory = ServiceFactory()
        services = factory.create_all_services()
        status_info = {
            "lokaal_model": services["lokaal"].is_ready(),
            "gemini_ai": services["gemini"].is_ready(),
            "overall_status": all(s.is_ready() for s in services.values()),
            "timestamp": "nu beschikbaar",
            "bericht": "Alle services operationeel"
        }
        if not status_info["overall_status"]:
            status_info["bericht"] = "Sommige services niet beschikbaar"
        return status_info
    except Exception as e:
        return {
            "lokaal_model": False, 
            "gemini_ai": False, 
            "overall_status": False,
            "fout": str(e),
            "bericht": "Service controle gefaald"
        }
