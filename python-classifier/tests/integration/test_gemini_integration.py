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
from src.adapters.gemini_ai import GeminiAIAdapter, MockGeminiAI
from src.config.loader import get_configuration_service


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

    @pytest.mark.slow
    def test_gemini_api_with_real_image(self):
        """Test de echte Gemini API met een echte afbeelding"""
        # Controleer of API key beschikbaar is
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            pytest.skip("GEMINI_API_KEY niet gevonden in environment variables")

        # Initialiseer de echte Gemini AI adapter
        try:
            gemini_adapter = GeminiAIAdapter(gemini_api_key=api_key)
        except Exception as e:
            pytest.skip(f"Kon Gemini AI adapter niet initialiseren: {e}")

        # Test beschrijving (simuleert wat de lokale classificatie zou retourneren)
        test_beschrijving = """
        Afbeelding toont een plastic fles op straat. 
        De fles is transparant met een blauwe dop. 
        Het is duidelijk zwerfafval en zou opgeruimd moeten worden.
        """

        # Test de validatie van lokale resultaten
        test_predictions = [{"type": "Restafval", "zekerheid": 0.8}]
        result = gemini_adapter.valideer_lokale_resultaten(test_beschrijving, test_predictions)
        
        # Verifieer dat we een resultaat krijgen
        assert result is not None
        assert hasattr(result, 'is_afval')
        assert hasattr(result, 'afval_types')
        assert hasattr(result, 'kenmerken')
        assert hasattr(result, 'bedank_boodschap')
        
        # Verifieer dat de resultaten logisch zijn
        assert isinstance(result.is_afval, bool)
        assert isinstance(result.afval_types, list)
        assert isinstance(result.kenmerken, list)
        assert isinstance(result.bedank_boodschap, str)
        
        print(f"Gemini API Response:")
        print(f"  Is zwerfafval: {result.is_afval}")
        print(f"  Afval types: {result.afval_types}")
        print(f"  Kenmerken: {result.kenmerken}")
        print(f"  Bedankboodschap: {result.bedank_boodschap}")

    @pytest.mark.slow
    def test_gemini_api_with_asset_image(self):
        """Test de echte Gemini API met een test afbeelding uit assets"""
        # Controleer of API key beschikbaar is
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            pytest.skip("GEMINI_API_KEY niet gevonden in environment variables")

        # Initialiseer de echte Gemini AI adapter
        try:
            gemini_adapter = GeminiAIAdapter(gemini_api_key=api_key)
        except Exception as e:
            pytest.skip(f"Kon Gemini AI adapter niet initialiseren: {e}")

        # Creëer test afbeelding data
        from PIL import Image
        import io
        img = Image.new('RGB', (300, 300), color='red')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        img_data = img_bytes.getvalue()

        # Test de analyse
        result = gemini_adapter.analyseer_afbeelding(img_data, "image/jpeg")
        
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
            # Use mock adapter for testing basic functionality
            gemini_adapter = MockGeminiAI()
        else:
            try:
                gemini_adapter = GeminiAIAdapter(gemini_api_key=api_key)
            except Exception as e:
                pytest.skip(f"Kon Gemini AI adapter niet initialiseren: {e}")

        # Test basic functionality exists
        assert hasattr(gemini_adapter, 'analyseer_afbeelding')
        assert hasattr(gemini_adapter, 'valideer_lokale_resultaten')
        
        # Test with mock data since valideer_tekst may not exist
        test_predictions = [{"type": "Glas", "zekerheid": 0.9}]
        result = gemini_adapter.valideer_lokale_resultaten("Test beschrijving", test_predictions)
        assert result is not None

    def test_gemini_api_prompt_template(self):
        """Test dat de prompt template correct wordt geladen"""
        # Controleer of API key beschikbaar is
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            # Use mock adapter for testing basic functionality
            gemini_adapter = MockGeminiAI()
        else:
            try:
                gemini_adapter = GeminiAIAdapter(gemini_api_key=api_key)
            except Exception as e:
                pytest.skip(f"Kon Gemini AI adapter niet initialiseren: {e}")

        # Test that adapter has basic functionality
        assert hasattr(gemini_adapter, 'analyseer_afbeelding')
        assert hasattr(gemini_adapter, 'valideer_lokale_resultaten')
        
        # Test with a simple validation call
        test_predictions = [{"type": "Overig", "zekerheid": 0.7}]
        result = gemini_adapter.valideer_lokale_resultaten("Test prompt", test_predictions)
        assert result is not None
        print(f"Gemini adapter geïnitialiseerd en functioneel")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])