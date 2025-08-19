#!/usr/bin/env python3
"""
Eenvoudige test om te controleren of de echte Gemini API werkt
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

def test_gemini_api():
    """Test de echte Gemini API direct"""
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
        # Import Google Generative AI
        import google.generativeai as genai
        
        # Configureer de API
        genai.configure(api_key=api_key)
        
        # Maak een model instance
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Test prompt
        prompt = "Wat is 2+2? Geef alleen het antwoord."
        
        print("Versturen van test prompt naar Gemini API...")
        response = model.generate_content(prompt)
        
        if response.text:
            print(f"Succes! Response van Gemini API: {response.text.strip()}")
            return True
        else:
            print("Geen response ontvangen van Gemini API")
            return False
            
    except Exception as e:
        print(f"FOUT bij communicatie met Gemini API: {e}")
        return False

if __name__ == "__main__":
    success = test_gemini_api()
    print(f"\nTest resultaat: {'GESLAAGD' if success else 'GEFAALD'}")
    sys.exit(0 if success else 1)