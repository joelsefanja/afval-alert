from src.models.schemas import GeminiClassification
import logging
import json
import yaml
from typing import List, Dict, Any
from pathlib import Path

GOOGLE_AI_AVAILABLE = True
try:
    import google.generativeai as genai
    from google.generativeai import types
except ImportError:
    GOOGLE_AI_AVAILABLE = False
    logger = logging.getLogger(__name__)
    logger.warning("Google Generative AI package niet geïnstalleerd. Functionaliteit wordt uitgeschakeld.")

logger = logging.getLogger(__name__)

GOOGLE_AI_AVAILABLE = True
try:
    import google.generativeai as genai
except ImportError:
    GOOGLE_AI_AVAILABLE = False
    logger.warning("Google Generative AI package niet ge\u00efnstalleerd.  Functionaliteit wordt uitgeschakeld.")

class GeminiAIAdapter:
    def __init__(self, gemini_api_key: str, model_name: str = "gemini-1.5-flash"):
        """Initialiseert de Gemini AI adapter."""
        if not GOOGLE_AI_AVAILABLE:
            raise ImportError("Google Generative AI package is niet ge\u00efnstalleerd.")
        genai.configure(api_key=gemini_api_key)
        self.model = genai.GenerativeModel(model_name)
        self.prompts = self._load_prompts()
        
    def _load_prompts(self) -> Dict[str, Any]:
        """Laad prompts uit YAML configuratie"""
        prompts_file = Path(__file__).parent.parent / "config/data/gemini_prompts.yaml"
        with open(prompts_file, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f)

    def analyseer_afbeelding(self, afbeelding_bytes: bytes, mime_type: str = "image/jpeg") -> GeminiClassification:
        """Analyseer afbeelding met Gemini Vision API"""
        try:
            image_data = self._prepare_image_data(afbeelding_bytes, mime_type)
            logger.info(f"MIME type: {image_data['mime_type']}")
            logger.info(f"Image data size: {len(image_data['data'])}")
            prompt = self._build_image_analysis_prompt()
            logger.info(f"Gemini API prompt: {prompt}")
            response = self.model.generate_content([prompt, image_data['data']])
            logger.info(f"Raw Gemini API response: {response}")
            return self._process_image_response(response)
        except Exception as e:
            logger.error(f"Fout bij Gemini analyse: {e}")
            logger.exception(e)
            return self._get_fallback_response("error")
    
    def _prepare_image_data(self, afbeelding_bytes: bytes, mime_type: str = "image/jpeg"):
        """Prepareer afbeelding data voor Gemini Vision"""
        return {
            "mime_type": mime_type,
            "data": afbeelding_bytes
        }
    
    def _build_image_analysis_prompt(self) -> str:
        """Bouw image analysis prompt uit YAML configuratie"""
        config = self.prompts["gemini_prompts"]["image_analysis"]
        return f"{config['system_role']}\n\n{config['task_description']}\n\n{config['output_format']}\n\n{config['constraints']}"
    
    def _process_image_response(self, response) -> GeminiClassification:
        """Verwerk Gemini Vision response"""
        if not response or not response.text:
            logger.warning("Lege response van Gemini AI")
            return self._get_fallback_response("no_response")

        logger.info(f"Raw response from Gemini: {response.text[:200]}")
        cleaned_text = self._clean_response_text(response.text)
        result_data = self._parse_json_response(cleaned_text)
        return self._create_classification_result(result_data)
    
    def _clean_response_text(self, response_text: str) -> str:
        """Clean markdown formatting uit response text"""
        text = response_text.strip()
        text = text.removeprefix("```json").removeprefix("```")
        text = text.removesuffix("```").strip()
        logger.info(f"Cleaned response: {repr(text[:100])}")
        return text
    
    def _parse_json_response(self, response_text: str) -> Dict[str, Any]:
        """Parse JSON response met fallback handling"""
        try:
            logging.info(f"Raw response text before JSON parsing: {response_text}")
            result = json.loads(response_text)
            logging.info(f"Successfully parsed JSON: {result}")
            return result
        except json.JSONDecodeError as e:
            logger.warning(f"JSON parse fout: {e}")
            logger.exception(e)
            return self.prompts["fallback_responses"]["validation_fallback"]
    
    def _create_classification_result(self, result_data: Dict[str, Any]) -> GeminiClassification:
        """Maak GeminiClassification uit result data"""
        logging.info(f"Result data in _create_classification_result: {result_data}")
        validated_data = self._validate_result_data(result_data)
        afval_types = self._process_afval_types(validated_data.get("afval_types", []))
        
        return GeminiClassification(
            is_afval=validated_data["is_afval"],
            afval_types=afval_types,
            kenmerken=validated_data["kenmerken"],
            bedank_boodschap=validated_data.get("bedank_boodschap", "")
        )
    
    def _validate_result_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Valideer en zet defaults voor result data"""
        defaults = self.prompts["fallback_responses"]["validation_fallback"]
        return {
            "is_afval": data.get("is_afval", defaults["is_afval"]),
            "afval_types": data.get("afval_types", defaults["afval_types"]),
            "kenmerken": data.get("kenmerken", defaults["kenmerken"]),
            "bedank_boodschap": data.get("bedank_boodschap", defaults.get("bedank_boodschap", ""))
        }
    
    def _process_afval_types(self, afval_types_data: List[Dict]) -> List[Dict]:
        """Process afval types data"""
        return [{"afval_type": item.get("afval_type", "niet_classificeerbaar"), 
                "zekerheid": float(item.get("zekerheid", 0.0))} for item in afval_types_data]
    
    def _get_fallback_response(self, response_type: str) -> GeminiClassification:
        """Krijg fallback response uit YAML configuratie"""
        fallback = self.prompts["fallback_responses"][response_type]
        return GeminiClassification(
            is_afval=fallback["is_afval"],
            afval_types=fallback["afval_types"],
            kenmerken=fallback["kenmerken"],
            bedank_boodschap=fallback["bedank_boodschap"]
        )

    def valideer_lokale_resultaten(self, lokale_beschrijving: str, lokale_voorspellingen: list) -> GeminiClassification:
        """Valideer lokale resultaten met Gemini text-only"""
        try:
            prompt = self._build_validation_prompt(lokale_beschrijving, lokale_voorspellingen)
            response = self.model.generate_content(prompt)
            return self._process_validation_response(response, lokale_voorspellingen)
        except Exception as e:
            logger.error(f"Fout bij Gemini validatie: {e}")
            return self._create_validation_fallback(lokale_voorspellingen)
    
    def _build_validation_prompt(self, lokale_beschrijving: str, lokale_voorspellingen: list) -> str:
        """Bouw validation prompt met placeholders uit YAML"""
        config = self.prompts["gemini_prompts"]["text_validation"]
        voorspellingen_tekst = ", ".join([f"{p['type']} ({p['zekerheid']:.2f})" for p in lokale_voorspellingen[:3]])
        
        task_desc = config["task_description"].format(
            local_description=lokale_beschrijving,
            local_predictions=voorspellingen_tekst
        )
        return f"{config['system_role']}\n\n{task_desc}\n\n{config['output_format']}\n\n{config['constraints']}"
    
    def _process_validation_response(self, response, lokale_voorspellingen: list) -> GeminiClassification:
        """Verwerk Gemini validation response"""
        if not response.text:
            logger.warning("Lege validation response van Gemini AI")
            return self._create_validation_fallback(lokale_voorspellingen)
        
        cleaned_text = self._clean_response_text(response.text)
        result_data = self._parse_json_response(cleaned_text)
        return self._create_classification_result(result_data)
    
    def _create_validation_fallback(self, lokale_voorspellingen: list) -> GeminiClassification:
        """Maak fallback response gebaseerd op lokale voorspellingen"""
        fallback = self.prompts["fallback_responses"]["validation_fallback"].copy()
        defaults = self.prompts["fallback_responses"]["validation_fallback"]

        if lokale_voorspellingen:
            fallback["afval_types"] = [{
                "afval_type": lokale_voorspellingen[0]['type'],
                "zekerheid": lokale_voorspellingen[0]['zekerheid']
            }]

        return GeminiClassification(
            is_afval=fallback.get("is_afval", defaults["is_afval"]),
            afval_types=fallback.get("afval_types", defaults["afval_types"]),
            kenmerken=fallback.get("kenmerken", defaults["kenmerken"]),
            bedank_boodschap=fallback.get("bedank_boodschap", defaults.get("bedank_boodschap", ""))
        )

class MockGeminiAI(GeminiAIAdapter):
    def __init__(self):
        pass
        
    def analyseer_afbeelding(self, afbeelding_bytes: bytes) -> GeminiClassification:
        """Mock implementation for image analysis"""
        return GeminiClassification(
            is_afval=True,
            afval_types=[
                {"afval_type": "plastic_flessen", "zekerheid": 0.8},
                {"afval_type": "blikjes", "zekerheid": 0.15}
            ],
            kenmerken=["mock analyse", "test data"],
            bedank_boodschap="Bedankt voor je melding! (Mock response)"
        )
    
    def valideer_lokale_resultaten(self, lokale_beschrijving: str, lokale_voorspellingen: list) -> GeminiClassification:
        """Mock implementation for local result validation"""
        # Use the first local prediction as base
        if lokale_voorspellingen:
            base_type = lokale_voorspellingen[0]['type']
            base_score = min(lokale_voorspellingen[0]['zekerheid'] + 0.1, 1.0)  # Slight confidence boost
        else:
            base_type = "niet_classificeerbaar"
            base_score = 0.6
            
        return GeminiClassification(
            is_afval=True,
            afval_types=[{"afval_type": base_type, "zekerheid": base_score}],
            kenmerken=["mock validatie", "gebaseerd op lokaal model"],
            bedank_boodschap="Bedankt! Onze AI validatie is succesvol. (Mock)"
        )