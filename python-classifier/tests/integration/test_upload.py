#!/usr/bin/env python3
"""Quick test script for manual image upload testing"""

import requests
from pathlib import Path
from PIL import Image
import io
import sys

def create_test_image():
    """Create a simple test image"""
    img = Image.new('RGB', (224, 224), color='red')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    return img_bytes.getvalue()

def create_test_image_webp():
    """Create a simple test image in webp format"""
    img = Image.new('RGB', (224, 224), color='blue')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='WEBP')
    img_bytes.seek(0)
    return img_bytes.getvalue()

def test_upload(image_path=None, image_type="jpeg"):
    """Test image upload to classification API"""
    url = "http://127.0.0.1:8000/classificeer"
    
    if image_path and Path(image_path).exists():
        print(f"Testing with real image: {image_path}")
        with open(image_path, 'rb') as f:
            files = {'file': (Path(image_path).name, f, 'image/jpeg')}
            response = requests.post(url, files=files, timeout=30)
    else:
        print("Testing with generated test image...")
        if image_type == "webp":
            test_img = create_test_image_webp()
            files = {'afbeelding': ('test.webp', test_img, 'image/webp')}
        elif image_type == "png":
            img = Image.new('RGB', (224, 224), color='green')
            img_bytes = io.BytesIO()
            img.save(img_bytes, format='PNG')
            img_bytes.seek(0)
            test_img = img_bytes.getvalue()
            files = {'afbeelding': ('test.png', test_img, 'image/png')}
        else:
            test_img = create_test_image()
            files = {'afbeelding': ('afval.jpg', test_img, 'image/jpeg')}
        response = requests.post(url, files=files, timeout=30)

    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        import json
        result = response.json()
        print("SUCCESS!")
        print(json.dumps(result, indent=2))
        assert response.status_code == 200
        assert "data" in result
        assert "primaire_classificatie" in result["data"]
    else:
        print(f"ERROR: {response.text}")
        assert False, f"Upload failed: {response.status_code} - {response.text}"

if __name__ == "__main__":
    if len(sys.argv) > 1:
        test_upload(sys.argv[1])
    else:
        test_upload(image_type="jpeg")
        test_upload(image_type="webp")