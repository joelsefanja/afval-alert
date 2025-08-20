"""
End-to-End Tests voor Classificatie met Echte Gemini API
Test volledige workflows met de echte Google Gemini API
"""

import pytest
import sys
import os
import time
import subprocess
import tempfile
from pathlib import Path
import io
from PIL import Image
import requests
import json
import threading

# Voeg parent directory toe aan path
src_path = str(Path(__file__).parent.parent.parent / "src")
if src_path not in sys.path:
    sys.path.insert(0, src_path)

def create_test_image(width=299, height=299, color='red', format='JPEG') -> bytes:
    """Maak een eenvoudige test afbeelding"""
    img = Image.new('RGB', (width, height), color=color)
    img_bytes = io.BytesIO()
    img.save(img_bytes, format=format)
    return img_bytes.getvalue()

class TestE2ERealGemini:
    """E2E tests met echte Gemini API (vereist GEMINI_API_KEY in .env)"""
    
    def setup_method(self):
        """Setup voor elke test"""
        # Laad environment variables
        env_path = Path(__file__).parent.parent.parent / ".env"
        if env_path.exists():
            with open(env_path) as f:
                for line in f:
                    if line.strip() and not line.startswith("#"):
                        key, value = line.strip().split("=", 1)
                        os.environ[key] = value
        
        # Controleer of API key beschikbaar is
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            pytest.skip("GEMINI_API_KEY niet gevonden in environment variables")
    
    def test_real_gemini_classification(self):
        """Test classificatie met echte Gemini API"""
        # Start de server met correcte Python path
        env = os.environ.copy()
        env['PYTHONPATH'] = src_path
        
        server_process = subprocess.Popen([
            sys.executable, "-m", "uvicorn", "afval_alert.api.main:app",
            "--host", "127.0.0.1", 
            "--port", "8004",
            "--log-level", "info"
        ], env=env)
        
        # Wacht tot server is gestart
        max_wait = 30
        server_ready = False
        for _ in range(max_wait):
            try:
                response = requests.get("http://127.0.0.1:8004/gezondheid", timeout=2)
                if response.status_code == 200:
                    server_ready = True
                    break
            except requests.exceptions.RequestException:
                pass
            time.sleep(1)
        
        if not server_ready:
            server_process.terminate()
            pytest.fail("Server niet gestart binnen 30 seconden")
        
        try:
            # Maak test afbeelding
            test_image = create_test_image()
            
            # Verstuur classificatie request
            response = requests.post(
                "http://127.0.0.1:8004/classificeer",
                files={"afbeelding": ("afval.jpg", test_image, "image/jpeg")},
                timeout=60
            )
            
            # Controleer response
            assert response.status_code == 200, f"Verwacht status 200, kreeg {response.status_code}: {response.text}"
            
            data = response.json()
            assert data["status"] == "success"
            assert "data" in data
            assert "lokale_classificatie" in data["data"]
            assert "gemini_classificatie" in data["data"]
            
            # Controleer Gemini classificatie resultaten
            gemini_data = data["data"]["gemini_classificatie"]
            assert "is_zwerfafval" in gemini_data
            assert "zwerfafval_type" in gemini_data
            assert "zekerheid" in gemini_data
            assert "kenmerken" in gemini_data
            assert "bedank_boodschap" in gemini_data
            
            print(f"Real Gemini classification result:")
            print(f"- Is zwerfafval: {gemini_data['is_zwerfafval']}")
            print(f"- Type: {gemini_data['zwerfafval_type']}")
            print(f"- Zekerheid: {gemini_data['zekerheid']}")
            print(f"- Kenmerken: {gemini_data['kenmerken']}")
            print(f"- Bericht: {gemini_data['bedank_boodschap']}")
            
        finally:
            # Stop de server
            server_process.terminate()
            server_process.wait(timeout=10)
    
    def test_health_check_with_real_api(self):
        """Test gezondheid endpoint met echte API key"""
        # Start de server met correcte Python path
        env = os.environ.copy()
        env['PYTHONPATH'] = src_path
        
        server_process = subprocess.Popen([
            sys.executable, "-m", "uvicorn", "afval_alert.api.main:app",
            "--host", "127.0.0.1", 
            "--port", "8005",
            "--log-level", "info"
        ], env=env)
        
        # Wacht tot server is gestart
        max_wait = 30
        server_ready = False
        for _ in range(max_wait):
            try:
                response = requests.get("http://127.0.0.1:8005/gezondheid", timeout=2)
                if response.status_code == 200:
                    server_ready = True
                    break
            except requests.exceptions.RequestException:
                pass
            time.sleep(1)
        
        if not server_ready:
            server_process.terminate()
            pytest.fail("Server niet gestart binnen 30 seconden")
        
        try:
            # Verstuur gezondheid check
            response = requests.get("http://127.0.0.1:8005/gezondheid", timeout=10)
            
            assert response.status_code == 200
            data = response.json()
            assert data["status"] in ["gezond", "verminderd"]
            assert "configuratie_geladen" in data
            
            print(f"Health check result: {data}")
            
        finally:
            # Stop de server
            server_process.terminate()
            server_process.wait(timeout=10)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])