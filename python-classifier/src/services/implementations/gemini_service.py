"""Gemini Service Implementation"""

import json
from typing import Any, Dict, List

from ...config.afval_config import AfvalConfig
from ...config.app_config import AppConfig
from ...decorators.logging_decorator import logged
from ...decorators.singleton_decorator import singleton
from ...exceptions.service_exceptions import ServiceNotAvailableError


@singleton
class GeminiService:
    """Ultra-compacte Gemini service"""

    def __init__(
        self, app_config: AppConfig = AppConfig(), afval_config: AfvalConfig = None
    ):
        self.app_config = app_config
        self.config = afval_config or AfvalConfig.from_yaml()
        self.model = None
        self._initialized = False

    def _lazy_init(self):
        """Lazy initialization - alleen bij eerste gebruik"""
        if not self._initialized:
            if not self.app_config.gemini_api_key:
                raise ServiceNotAvailableError("GEMINI_API_KEY niet gevonden")

            # Import only when needed
            import google.generativeai as genai
            
            genai.configure(api_key=self.app_config.gemini_api_key)
            self.model = genai.GenerativeModel("gemini-1.5-flash")
            self._initialized = True

    @logged
    def classify(self, features) -> List[Dict[str, Any]]:
        """Classificeer features via Gemini - super compact"""
        self._lazy_init()  # Initialiseer alleen bij eerste gebruik
        
        # Import tensor processing only when needed
        from ...features.tensor_processing import (
            extract_tensor_stats,
            format_feature_description,
        )
        from ...features.response_validation import validate_gemini_response
        
        # Feature stats naar prompt
        stats = extract_tensor_stats(features)
        feature_text = format_feature_description(stats)

        # Maak prompt
        prompt = self.config.prompt_template.format(
            afval_types=", ".join(self.config.afval_types),
            lokaal_resultaat=feature_text,
        )

        # Gemini call & parse
        response = self.model.generate_content([prompt])
        result = json.loads(response.text.strip())

        # Valideer & return
        return validate_gemini_response(result, self.config.afval_types)

    def is_ready(self) -> bool:
        """Quick check zonder API connectie te maken"""
        if not self.app_config.gemini_api_key:
            RED = "\033[91m"
            RESET = "\033[0m"
            print(f"{RED}ERROR: GEMINI_API_KEY is niet ingesteld in uw .env bestand.{RESET}")
        
        return bool(self.app_config.gemini_api_key) and len(self.config.afval_types) > 0
