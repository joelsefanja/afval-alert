"""Service Factory"""

from typing import Any, Dict

from ..config.afval_config import AfvalConfig
from ..config.app_config import AppConfig
from .implementations.gemini_service import GeminiService
from .implementations.lokale_service import LokaleService


class ServiceFactory:
    """Factory voor het maken van services met shared configuratie"""

    def __init__(self):
        self._app_config = AppConfig()
        self._afval_config = AfvalConfig.from_yaml()

    def create_lokale_service(self) -> LokaleService:
        """Maak lokale classificatie service"""
        return LokaleService(self._app_config)

    def create_gemini_service(self) -> GeminiService:
        """Maak Gemini service"""
        return GeminiService(self._app_config, self._afval_config)

    def create_all_services(self) -> Dict[str, Any]:
        """Maak alle services in één keer"""
        return {
            "lokaal": self.create_lokale_service(),
            "gemini": self.create_gemini_service(),
        }
