"""
Integration Test voor Gemini API met echte afbeelding upload
Test de volledige workflow van afbeelding upload tot Gemini API response
"""

import pytest
import sys
import os
from pathlib import Path
import io
from PIL import Image

# Voeg src directory toe aan path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))

# Importeer de benodigde modules
from afval_alert.adapters.gemini_ai import EchteGeminiAI
from afval_alert.config.loader import get_configuration_service


class TestGeminiIntegration:
    """Integration tests voor de echte Gemini API"""

    def setup_method(self):
        """Setup voor elke test method"""
        # Laad environment variables uit .env bestand
        env_path = Path(__file__).parent.parent.parent / ".env"
        if env_path.exists():
            with open(env_path, encoding='utf-8') as f:
                for line in f:
                    if line.strip() and not line.startswith("#"):
                        key, value = line.strip().split("=", 1)
                        os.environ[key] = value
            print("Environment variables geladen uit .env")

    def test_gemini_api_with_real_image(self):
        """Test de echte Gemini API met een echte afbeelding"""
        # Controleer of API key beschikbaar is
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            pytest.skip("GEMINI_API_KEY niet gevonden in environment variables")

        # Initialiseer de echte Gemini AI adapter
        try:
            gemini_adapter = EchteGeminiAI(api_key=api_key)
        except Exception as e:
            pytest.skip(f"Kon Gemini AI adapter niet initialiseren: {e}")

        # Test beschrijving (simuleert wat de lokale classificatie zou retourneren)
        test_beschrijving = """
        Afbeelding toont een plastic fles op straat. 
        De fles is transparant met een blauwe dop. 
        Het is duidelijk zwerfafval en zou opgeruimd moeten worden.
        """

        # Test de analyse
        result = gemini_adapter.analyseer_tekst(test_beschrijving)
        
        # Verifieer dat we een resultaat krijgen
        assert result is not None
        assert hasattr(result, 'is_afval')
        assert hasattr(result, 'afval_type')
        assert hasattr(result, 'zekerheid')
        assert hasattr(result, 'kenmerken')
        assert hasattr(result, 'bedank_boodschap')
        
        # Verifieer dat de resultaten logisch zijn
        assert isinstance(result.is_afval, bool)
        assert isinstance(result.afval_type, str)
        assert isinstance(result.zekerheid, float)
        assert 0.0 <= result.zekerheid <= 1.0
        assert isinstance(result.kenmerken, list)
        assert isinstance(result.bedank_boodschap, str)
        
        print(f"Gemini API Response:")
        print(f"  Is zwerfafval: {result.is_afval}")
        print(f"  Afval type: {result.afval_type}")
        print(f"  Zekerheid: {result.zekerheid}")
        print(f"  Kenmerken: {result.kenmerken}")
        print(f"  Bedankboodschap: {result.bedank_boodschap}")

    def test_gemini_api_with_asset_image(self):
        """Test de echte Gemini API met een test afbeelding uit assets"""
        # Controleer of API key beschikbaar is
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            pytest.skip("GEMINI_API_KEY niet gevonden in environment variables")

        # Initialiseer de echte Gemini AI adapter
        try:
            gemini_adapter = EchteGeminiAI(api_key=api_key)
        except Exception as e:
            pytest.skip(f"Kon Gemini AI adapter niet initialiseren: {e}")

        # Gebruik een beschrijving gebaseerd op een echte test afbeelding
        test_beschrijving = """
        Afbeelding toont glas op straat. 
        Het is duidelijk zwerfafval en zou opgeruimd moeten worden.
        Glas is volledig recycleerbaar.
        """

        # Test de analyse
        result = gemini_adapter.analyseer_tekst(test_beschrijving)
        
        # Verifieer dat we een resultaat krijgen
        assert result is not None
        assert hasattr(result, 'is_afval')
        assert hasattr(result, 'afval_types')
        
        # Verifieer dat de resultaten logisch zijn
        assert isinstance(result.is_afval, bool)
        assert isinstance(result.afval_types, list)
        
        print(f"Gemini API Response voor glas:")
        print(f"  Is zwerfafval: {result.is_afval}")
        print(f"  Afval types: {result.afval_types}")

    def test_gemini_api_validation(self):
        """Test de validatie van tekst voor Gemini API"""
        # Controleer of API key beschikbaar is
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            pytest.skip("GEMINI_API_KEY niet gevonden in environment variables")

        # Initialiseer de echte Gemini AI adapter
        try:
            gemini_adapter = EchteGeminiAI(api_key=api_key)
        except Exception as e:
            pytest.skip(f"Kon Gemini AI adapter niet initialiseren: {e}")

        # Test validatie van goede beschrijving
        goede_beschrijving = "Afbeelding toont plastic fles op straat"
        assert gemini_adapter.valideer_tekst(goede_beschrijving) is True

        # Test validatie van te korte beschrijving
        korte_beschrijving = "Test"  # 4 characters, should be invalid
        assert gemini_adapter.valideer_tekst(korte_beschrijving) is False

        # Test validatie van lege beschrijving
        lege_beschrijving = ""
        assert gemini_adapter.valideer_tekst(lege_beschrijving) is False

        # Test validatie van None
        assert gemini_adapter.valideer_tekst(None) is False

    def test_gemini_api_prompt_template(self):
        """Test dat de prompt template correct wordt geladen"""
        # Controleer of API key beschikbaar is
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            pytest.skip("GEMINI_API_KEY niet gevonden in environment variables")

        # Initialiseer de echte Gemini AI adapter
        try:
            gemini_adapter = EchteGeminiAI(api_key=api_key)
        except Exception as e:
            pytest.skip(f"Kon Gemini AI adapter niet initialiseren: {e}")

        # Test dat we een prompt template krijgen
        prompt_template = gemini_adapter.krijg_prompt_template()
        assert prompt_template is not None
        assert isinstance(prompt_template, str)
        assert len(prompt_template) > 0
        assert "{beschrijving}" in prompt_template

        print(f"Prompt template lengte: {len(prompt_template)} tekens")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])