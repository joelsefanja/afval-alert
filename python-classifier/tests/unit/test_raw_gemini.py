#!/usr/bin/env python3
"""
Simple test to see the raw Gemini API response
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

def test_raw_gemini_api():
    """Test the raw Gemini API response"""
    print("=== Raw Gemini API Test ===")
    
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
        import google.generativeai as genai
        
        # Configureer de API
        genai.configure(api_key=api_key)
        
        # Maak een model instance
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Test prompt
        prompt = """Je bent een expert in zwerfafval herkenning voor Nederlandse gemeenten.

Analyseer de volgende beschrijving en bepaal:
1. Is dit zwerfafval? (true/false)
2. Wat voor type afval is het?
3. Hoe zeker ben je van je classificatie? (0.0 - 1.0)
4. Welke kenmerken zie je?
5. Geef een vriendelijke bedankboodschap aan de melder.

Geef je antwoord ALLEEN in geldig JSON-formaat met exact deze structuur:
{
  "is_afval": true,
  "afval_type": "plastic_flessen",
  "zekerheid": 0.85,
  "kenmerken": ["transparant", "plastic", "fles vorm"],
  "bedank_boodschap": "Bedankt voor je melding van plastic afval!"
}

Zorg dat je JSON correct is geformuleerd en valide is.
Gebruik alleen de beschikbare afvaltype categorieën.
Geef geen extra tekst of uitleg, alleen de JSON.

Beschrijving: Gedetecteerd: plastic_flessen met 85.0% zekerheid"""

        print("Versturen van test prompt naar Gemini API...")
        response = model.generate_content(prompt)
        
        print(f"Raw response: {response}")
        print(f"Response text: {response.text}")
        
        return True
            
    except Exception as e:
        print(f"FOUT bij communicatie met Gemini API: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_raw_gemini_api()
    print(f"\nTest resultaat: {'GESLAAGD' if success else 'GEFAALD'}")
    sys.exit(0 if success else 1)