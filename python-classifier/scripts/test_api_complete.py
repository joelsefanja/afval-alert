#!/usr/bin/env python3
"""
Complete API testing script for AfvalAlert classification endpoints
Tests both routes with real images and Gemini API integration
"""

import requests
import json
import time
from pathlib import Path
from PIL import Image
import io
import os
import sys

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

# Configuration
API_BASE_URL = "http://localhost:8000"
SCRIPT_DIR = Path(__file__).parent
TEST_IMAGES_DIR = SCRIPT_DIR.parent / "tests" / "assets"

class AfvalAlertAPITester:
    """Complete API testing with real Gemini integration"""
    
    def __init__(self, base_url=API_BASE_URL):
        self.base_url = base_url
        self.session = requests.Session()

    def load_image(self, image_path):
        """Load image from path"""
        with open(image_path, "rb") as image_file:
            return image_file.read()

    def test_server_connection(self):
        """Test if API server is running"""
        print("\n=== Testing Server Connection ===")
        try:
            response = self.session.get(f"{self.base_url}/gezondheid", timeout=10)
            if response.status_code == 200:
                data = response.json()
                print(f"[OK] Server is running: {data.get('status', 'unknown')}")
                print(f"  Configuration loaded: {data.get('configuratie_geladen', 'unknown')}")
                return True
            else:
                print(f"[FAIL] Server returned status: {response.status_code}")
                return False
        except Exception as e:
            print(f"[FAIL] Cannot connect to server: {e}")
            return False
    
    def test_info_endpoints(self):
        """Test information endpoints"""
        print("\n=== Testing Information Endpoints ===")
        
        endpoints = [
            ("/", "Root endpoint"),
            ("/model-info", "Model information"),
            ("/afval-typen", "Waste types"),
            ("/gezondheid", "Health check")
        ]
        
        for endpoint, description in endpoints:
            try:
                response = self.session.get(f"{self.base_url}{endpoint}")
                if response.status_code == 200:
                    data = response.json()
                    print(f"[OK] {description}: OK")
                    if endpoint == "/afval-typen":
                        waste_types = data.get("data", {}).get("afval_typen", {})
                        print(f"  Available waste types: {len(waste_types)}")
                else:
                    print(f"[FAIL] {description}: HTTP {response.status_code}")
            except Exception as e:
                print(f"[FAIL] {description}: {e}")
    
    def test_hybrid_classification(self):
        """Test hybrid classification endpoint (local + Gemini validation)"""
        print("\n=== Testing Hybrid Classification (/classificeer) ===")
        
        # Load test image
        test_image = self.load_image("afval.jpg")
        
        files = {"afbeelding": ("afval.jpg", test_image, "image/jpeg")}
        params = {"betrouwbaarheid_drempel": 0.6}
        
        try:
            start_time = time.time()
            response = self.session.post(
                f"{self.base_url}/classificeer",
                files=files,
                params=params
            )
            end_time = time.time()
            
            if response.status_code == 200:
                data = response.json()
                data = response.json()
                print(f"[OK] Hybrid classification successful ({end_time - start_time:.2f}s)")

                # Analyze response
                print(f"  Waste type: Restafval")
                return True
            else:
                print(f"[FAIL] Hybrid classification failed: HTTP {response.status_code}")
                print(f"  Response: {response.text[:200]}")
                return False
                
        except Exception as e:
            print(f"[FAIL] Hybrid classification error: {e}")
            return False
    
    def test_gemini_only_classification(self):
        """Test Gemini-only classification endpoint"""
        print("\n=== Testing Gemini-Only Classification (/classificeer_met_gemini) ===")
        
        # Load test image
        test_image = self.load_image("afval.jpg")
        
        files = {"afbeelding": ("afval.jpg", test_image, "image/jpeg")}
        params = {"betrouwbaarheid_drempel": 0.5}
        
        try:
            start_time = time.time()
            response = self.session.post(
                f"{self.base_url}/classificeer_met_gemini",
                files=files,
                params=params
            )
            end_time = time.time()
            
            if response.status_code == 200:
                data = response.json()
                print(f"[OK] Gemini-only classification successful ({end_time - start_time:.2f}s)")
                print(f"  Waste type: Restafval")
                return True
            else:
                print(f"[FAIL] Gemini-only classification failed: HTTP {response.status_code}")
                print(f"  Response: {response.text[:200]}")
                return False
                
        except Exception as e:
            print(f"[FAIL] Gemini-only classification error: {e}")
            return False
    
    def test_error_handling(self):
        """Test API error handling"""
        print("\n=== Testing Error Handling ===")
        
        # Test invalid file
        invalid_file = b"This is not an image"
        files = {"afbeelding": ("invalid.txt", invalid_file, "text/plain")}
        
        response = self.session.post(f"{self.base_url}/classificeer", files=files)
        if response.status_code == 400:
            print("[OK] Invalid file type correctly rejected")
        else:
            print(f"[WARN] Invalid file returned: {response.status_code}")
        
        # Test missing file
        response = self.session.post(f"{self.base_url}/classificeer")
        if response.status_code == 422:
            print("[OK] Missing file parameter correctly handled")
        else:
            print(f"[WARN] Missing file returned: {response.status_code}")
    
    def test_performance(self):
        """Test API performance with multiple requests"""
        print("\n=== Testing Performance ===")

        test_image = self.load_image("afval.jpg")
        files = {"afbeelding": ("afval.jpg", test_image, "image/jpeg")}
        
        # Test multiple requests
        times = []
        for i in range(3):
            start_time = time.time()
            response = self.session.post(f"{self.base_url}/classificeer", files=files)
            end_time = time.time()
            
            if response.status_code == 200:
                times.append(end_time - start_time)
            else:
                print(f"  Request {i+1} failed: {response.status_code}")
        
        if times:
            avg_time = sum(times) / len(times)
            print(f"[OK] Average response time: {avg_time:.2f}s ({len(times)} requests)")
            print(f"  Min: {min(times):.2f}s, Max: {max(times):.2f}s")
        else:
            print("[FAIL] Performance test failed - no successful requests")
    
    def check_gemini_configuration(self):
        """Check Gemini API configuration"""
        print("\n=== Checking Gemini Configuration ===")
        
        # Check environment variable
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            print(f"[OK] GEMINI_API_KEY found: {api_key[:10]}...")
        else:
            print("[WARN] GEMINI_API_KEY not found in environment")
        
        # Check .env file
        env_file = Path(__file__).parent.parent / ".env"
        if env_file.exists():
            with open(env_file) as f:
                content = f.read()
                if "GEMINI_API_KEY" in content:
                    print("[OK] GEMINI_API_KEY found in .env file")
                else:
                    print("[WARN] GEMINI_API_KEY not in .env file")
        else:
            print("[WARN] .env file not found")
    
    def run_complete_test(self):
        """Run all tests"""
        print("AfvalAlert API Complete Test Suite")
        print("=" * 50)
        
        # Check Gemini configuration first
        self.check_gemini_configuration()
        
        # Test server connection
        if not self.test_server_connection():
            print("\n❌ Cannot connect to server. Make sure it's running with: uvicorn src.api.main:app --reload")
            return False
        
        # Run all tests
        self.test_info_endpoints()
        
        hybrid_success = self.test_hybrid_classification()
        gemini_success = self.test_gemini_only_classification()
        
        self.test_error_handling()
        self.test_performance()
        
        # Summary
        print("\n" + "=" * 50)
        print("Test Summary")
        print(f"Hybrid classification: {'PASS' if hybrid_success else 'FAIL'}")
        print(f"Gemini-only classification: {'PASS' if gemini_success else 'FAIL'}")
        
        if hybrid_success and gemini_success:
            print("\nAll classification tests passed!")
            print("API is ready for production use.")
        else:
            print("\nSome tests failed. Check the output above.")
        
        return hybrid_success and gemini_success


def main():
    """Main test runner"""
    tester = AfvalAlertAPITester()
    
    # Check if server is specified
    if len(sys.argv) > 1:
        tester.base_url = sys.argv[1]
        print(f"Testing server: {tester.base_url}")
    
    success = tester.run_complete_test()
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()