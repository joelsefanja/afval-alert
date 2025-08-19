#!/usr/bin/env python3
"""
Step by step test of the EchteGeminiAI adapter
"""

import os
import sys
from pathlib import Path
import json

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

def test_step_by_step():
    """Test the EchteGeminiAI adapter step by step"""
    print("=== Step by Step Test of EchteGeminiAI Adapter ===")
    
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
        
        # Get the prompt template
        sys.path.insert(0, str(Path(__file__).parent / "src"))
        from afval_alert.adapters.gemini_ai import EchteGeminiAI
        
        print("Creating EchteGeminiAI adapter...")
        gemini_adapter = EchteGeminiAI(api_key=api_key)
        
        # Get the prompt template
        prompt_template = gemini_adapter.krijg_prompt_template()
        print(f"Prompt template length: {len(prompt_template)} characters")
        
        # Test beschrijving
        beschrijving = "Gedetecteerd: plastic_flessen met 85.0% zekerheid"
        print(f"Test beschrijving: {beschrijving}")
        
        # Format the prompt
        prompt = prompt_template.format(beschrijving=beschrijving)
        print(f"Formatted prompt length: {len(prompt)} characters")
        
        # Send to Gemini API
        print("Sending to Gemini API...")
        response = model.generate_content(prompt)
        
        print(f"Raw response: {response}")
        print(f"Response text: {repr(response.text)}")
        
        # Now manually apply the same parsing logic as in the adapter
        if response.text:
            # Clean up the response text to extract JSON
            response_text = response.text.strip()
            print(f"After strip: {repr(response_text)}")
            
            # Remove any markdown code blocks if present
            if response_text.startswith("```json"):
                response_text = response_text[7:]  # Remove ```json
                print(f"After removing ```json: {repr(response_text)}")
            elif response_text.startswith("```"):
                response_text = response_text[3:]  # Remove ```
                print(f"After removing ```: {repr(response_text)}")
            if response_text.endswith("```"):
                response_text = response_text[:-3]  # Remove ```
                print(f"After removing trailing ```: {repr(response_text)}")
            
            response_text = response_text.strip()
            print(f"After final strip: {repr(response_text)}")
            
            # Try to parse JSON
            try:
                result_data = json.loads(response_text)
                print(f"Successfully parsed JSON: {result_data}")
                
                # Create GeminiClassification object
                from afval_alert.models.schemas import GeminiClassification
                result = GeminiClassification(
                    is_afval=result_data["is_afval"],
                    afval_type=result_data["afval_type"],
                    zekerheid=float(result_data["zekerheid"]),
                    kenmerken=result_data["kenmerken"],
                    bedank_boodschap=result_data["bedank_boodschap"]
                )
                
                print(f"Final result:")
                print(f"  Is zwerfafval: {result.is_afval}")
                print(f"  Afval type: {result.afval_type}")
                print(f"  Zekerheid: {result.zekerheid}")
                print(f"  Kenmerken: {result.kenmerken}")
                print(f"  Bericht: {result.bedank_boodschap}")
                
                return True
            except json.JSONDecodeError as je:
                print(f"JSON decode error: {je}")
                print(f"Response text that failed to parse: {repr(response_text)}")
                return False
        else:
            print("No response text received")
            return False
        
    except Exception as e:
        print(f"FOUT bij testen: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_step_by_step()
    print(f"\nTest resultaat: {'GESLAAGD' if success else 'GEFAALD'}")
    sys.exit(0 if success else 1)