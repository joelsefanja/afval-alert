#!/usr/bin/env python3
"""Simple test script to verify dev server functionality"""

import requests
import time
import sys
from pathlib import Path

def test_dev_server():
    """Test if the dev server is running correctly"""
    try:
        # Check if server is responding
        response = requests.get("http://localhost:8000/docs", timeout=5)
        if response.status_code == 200:
            print("✓ Dev server is running and responding correctly")
            return True
        else:
            print(f"✗ Dev server returned status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("✗ Dev server is not accessible - make sure it's running")
        return False
    except requests.exceptions.Timeout:
        print("✗ Dev server request timed out")
        return False
    except Exception as e:
        print(f"✗ Error testing dev server: {e}")
        return False

if __name__ == "__main__":
    print("Testing dev server...")
    success = test_dev_server()
    sys.exit(0 if success else 1)