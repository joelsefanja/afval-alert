#!/usr/bin/env python3
"""
Test the actual EchteGeminiAI adapter directly
"""

import os
import sys
from pathlib import Path

def load_env_file():
    """Laad environment variables uit .env bestand"""
    env_path = Path(__file__).parent / ".env"
    if env_path.exists():
        with open(env_path, encoding='utf-8') as f:
            for line in f:
                if line.strip() and not line.startswith("#"):
                    key, value = line.strip().split("=", 1)
                    os.environ[key] = value
        print("Environment variables geladen uit .env")
        return True
    else:
        print("Geen .env bestand gevonden")
        return False

def test_actual_adapter():
    """Test the actual EchteGeminiAI adapter"""
    print("=== Test Actual EchteGeminiAI Adapter ===")
    
    # Laad environment variables
    if not load_env_file():
        return False
    
    # Controleer API key
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("FOUT: GEMINI_API_KEY niet gevonden in environment variables")
        return False
    
    print(f"Gebruik API key: {api_key[:10]}...")
    
    try:
        # Importeer benodigde modules
        sys.path.insert(0, str(Path(__file__).parent / "src"))
        from afval_alert.adapters.gemini_ai import EchteGeminiAI
        
        print("Initialiseren van EchteGeminiAI adapter...")
        gemini_adapter = EchteGeminiAI(api_key=api_key)
        print("OK Adapter geinitialiseerd")
        
        # Test beschrijving
        beschrijving = "Gedetecteerd: plastic_flessen met 85.0% zekerheid"
        print(f"Test beschrijving: {beschrijving}")
        
        # Test validatie
        is_valid = gemini_adapter.valideer_tekst(beschrijving)
        print(f"Beschrijving is valid: {is_valid}")
        
        if not is_valid:
            print("FOUT: Beschrijving is niet valid")
            return False
        
        # Test analyse
        print("Analyseren met Gemini API...")
        result = gemini_adapter.analyseer_tekst(beschrijving)
        
        print(f"Resultaat:")
        print(f"  Is zwerfafval: {result.is_afval}")
        print(f"  Afval type: {result.afval_type}")
        print(f"  Zekerheid: {result.zekerheid}")
        print(f"  Kenmerken: {result.kenmerken}")
        print(f"  Bericht: {result.bedank_boodschap}")
        
        return True
        
    except Exception as e:
        print(f"FOUT bij testen van EchteGeminiAI adapter: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_actual_adapter()
    print(f"\nTest resultaat: {'GESLAAGD' if success else 'GEFAALD'}")
    sys.exit(0 if success else 1)