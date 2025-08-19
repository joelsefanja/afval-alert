#!/usr/bin/env python3
"""
Complete Integration Test for Image Upload to Gemini API
Tests the full flow from image upload to Gemini API response
"""

import os
import sys
from pathlib import Path
import io
from PIL import Image
import json
import time

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

def create_test_image(width=299, height=299, color='red', format='JPEG'):
    """Maak een eenvoudige test afbeelding"""
    img = Image.new('RGB', (width, height), color=color)
    img_bytes = io.BytesIO()
    img.save(img_bytes, format=format)
    img_bytes.seek(0)
    return img_bytes.getvalue()

def test_gemini_integration():
    """Test de complete integratie met echte afbeelding en Gemini API"""
    print("=== AfvalAlert Integration Test ===")
    print("Testen van volledige flow: afbeelding upload -> lokale classificatie -> Gemini API")
    
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
        from afval_alert.adapters.lokale_classificatie import MockLokaleClassificatie
        
        print("\n1. Initialiseren van adapters...")
        
        # Initialiseer adapters
        lokale_adapter = MockLokaleClassificatie()
        gemini_adapter = EchteGeminiAI(api_key=api_key)
        
        print("OK Adapters succesvol geinitialiseerd")
        
        # Maak test afbeelding
        print("\n2. Maken van test afbeelding...")
        test_image = create_test_image()
        print(f"OK Test afbeelding gemaakt ({len(test_image)} bytes)")
        
        # Simuleer lokale classificatie (in echte flow zou dit de afbeelding analyseren)
        print("\n3. Uitvoeren van lokale classificatie...")
        start_time = time.time()
        lokale_resultaat = lokale_adapter.classificeer_afbeelding(test_image)
        lokale_tijd = time.time() - start_time
        
        if not lokale_resultaat.success:
            print("FOUT: Lokale classificatie mislukt")
            return False
            
        print(f"OK Lokale classificatie voltooid ({lokale_tijd:.2f}s)")
        print(f"  Voorspellingen: {[p.class_name for p in lokale_resultaat.predictions]}")
        print(f"  Max betrouwbaarheid: {lokale_resultaat.max_confidence:.2f}")
        
        # Genereer beschrijving voor Gemini
        print("\n4. Genereren van beschrijving voor Gemini...")
        beschrijving = lokale_adapter.krijg_tekst_beschrijving(lokale_resultaat)
        print(f"OK Beschrijving gegenereerd ({len(beschrijving)} tekens)")
        print(f"  Beschrijving: {beschrijving[:100]}...")
        
        # Valideer beschrijving
        print("\n5. Valideren van beschrijving...")
        if not gemini_adapter.valideer_tekst(beschrijving):
            print("FOUT: Beschrijving is niet geldig voor Gemini API")
            return False
        print("OK Beschrijving is geldig")
        
        # Verstuur naar Gemini API
        print("\n6. Versturen naar Gemini API...")
        start_time = time.time()
        gemini_resultaat = gemini_adapter.analyseer_tekst(beschrijving)
        gemini_tijd = time.time() - start_time
        
        print(f"OK Gemini API response ontvangen ({gemini_tijd:.2f}s)")
        print(f"  Is zwerfafval: {gemini_resultaat.is_afval}")
        print(f"  Afval type: {gemini_resultaat.afval_type}")
        print(f"  Zekerheid: {gemini_resultaat.zekerheid:.2f}")
        print(f"  Kenmerken: {gemini_resultaat.kenmerken}")
        print(f"  Bericht: {gemini_resultaat.bedank_boodschap}")
        
        # Samenvatting
        print("\n=== TEST RESULTAAT ===")
        print("OK Volledige integratie test succesvol voltooid!")
        print(f"  Totale verwerkingstijd: {lokale_tijd + gemini_tijd:.2f}s")
        print(f"  Lokale classificatie: {lokale_tijd:.2f}s")
        print(f"  Gemini API: {gemini_tijd:.2f}s")
        
        return True
        
    except Exception as e:
        print(f"FOUT tijdens integratie test: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_with_real_image(image_path=None):
    """Test met een echte afbeelding uit de test assets"""
    print("=== AfvalAlert Integration Test met echte afbeelding ===")
    
    # Laad environment variables
    if not load_env_file():
        return False
    
    # Controleer API key
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("FOUT: GEMINI_API_KEY niet gevonden in environment variables")
        return False
    
    try:
        # Importeer benodigde modules
        sys.path.insert(0, str(Path(__file__).parent / "src"))
        from afval_alert.adapters.gemini_ai import EchteGeminiAI
        from afval_alert.adapters.lokale_classificatie import MockLokaleClassificatie
        
        print("Initialiseren van adapters...")
        lokale_adapter = MockLokaleClassificatie()
        gemini_adapter = EchteGeminiAI(api_key=api_key)
        
        # Gebruik opgegeven afbeelding of een test afbeelding
        if image_path and Path(image_path).exists():
            print(f"Gebruik opgegeven afbeelding: {image_path}")
            with open(image_path, 'rb') as f:
                image_data = f.read()
        else:
            # Gebruik een test afbeelding uit de assets
            test_assets_dir = Path(__file__).parent / "tests" / "assets" / "zwerfafval"
            if test_assets_dir.exists():
                test_images = list(test_assets_dir.glob("*.png"))
                if test_images:
                    test_image_path = test_images[0]
                    print(f"Gebruik test afbeelding: {test_image_path}")
                    with open(test_image_path, 'rb') as f:
                        image_data = f.read()
                else:
                    print("Geen test afbeeldingen gevonden, gebruik gegenereerde afbeelding")
                    image_data = create_test_image()
            else:
                print("Geen test assets gevonden, gebruik gegenereerde afbeelding")
                image_data = create_test_image()
        
        print(f"Afbeelding geladen ({len(image_data)} bytes)")
        
        # Simuleer lokale classificatie
        print("Uitvoeren van lokale classificatie...")
        lokale_resultaat = lokale_adapter.classificeer_afbeelding(image_data)
        
        if not lokale_resultaat.success:
            print("FOUT: Lokale classificatie mislukt")
            return False
            
        print("Lokale classificatie voltooid")
        
        # Genereer beschrijving voor Gemini
        beschrijving = lokale_adapter.krijg_tekst_beschrijving(lokale_resultaat)
        print(f"Beschrijving gegenereerd: {beschrijving}")
        
        # Verstuur naar Gemini API
        print("Versturen naar Gemini API...")
        gemini_resultaat = gemini_adapter.analyseer_tekst(beschrijving)
        
        print("\n=== GEMINI API RESULTAAT ===")
        print(f"Is zwerfafval: {gemini_resultaat.is_afval}")
        print(f"Afval type: {gemini_resultaat.afval_type}")
        print(f"Zekerheid: {gemini_resultaat.zekerheid:.2f}")
        print(f"Kenmerken: {gemini_resultaat.kenmerken}")
        print(f"Bericht: {gemini_resultaat.bedank_boodschap}")
        
        return True
        
    except Exception as e:
        print(f"FOUT tijdens test met echte afbeelding: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    # Bepaal welke test uitgevoerd moet worden
    if len(sys.argv) > 1:
        if sys.argv[1] == "--real-image":
            # Test met echte afbeelding
            image_path = sys.argv[2] if len(sys.argv) > 2 else None
            success = test_with_real_image(image_path)
        else:
            # Test met opgegeven afbeelding
            success = test_with_real_image(sys.argv[1])
    else:
        # Standaard test met gegenereerde afbeelding
        success = test_gemini_integration()
    
    print(f"\nTest resultaat: {'GESLAAGD' if success else 'GEFAALD'}")
    sys.exit(0 if success else 1)