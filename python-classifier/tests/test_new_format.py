"""
Test script to verify the new API format.
"""

import requests
import sys
from pathlib import Path

# Add src directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

def test_afval_typen_endpoint():
    """Test that the afval-typen endpoint returns the correct format."""
    try:
        # Test the endpoint
        response = requests.get("http://localhost:8000/afval-typen")
        data = response.json()
        
        print("Afval-typen endpoint response:")
        print(f"Status code: {response.status_code}")
        print(f"Response: {data}")
        
        # Verify the format
        assert "afval_typen" in data, "Response should contain 'afval_typen' key"
        assert isinstance(data["afval_typen"], list), "'afval_typen' should be a list"
        
        # Check that we have the expected categories
        expected_categories = [
            "Grofvuil", "Restafval", "Glas", "Papier en karton",
            "Organisch", "Textiel", "Elektronisch afval", 
            "Bouw- en sloopafval", "Chemisch afval", "Overig", "Geen afval"
        ]
        
        # Check that all expected categories are present
        for category in expected_categories:
            assert category in data["afval_typen"], f"Expected category '{category}' not found"
        
        print("✓ Afval-typen endpoint test passed")
        return True
        
    except Exception as e:
        print(f"✗ Afval-typen endpoint test failed: {e}")
        return False

def test_model_info_endpoint():
    """Test that the model-info endpoint returns the correct format."""
    try:
        # Test the endpoint
        response = requests.get("http://localhost:8000/model-info")
        data = response.json()
        
        print("\nModel-info endpoint response:")
        print(f"Status code: {response.status_code}")
        print(f"Response: {data}")
        
        # Verify the format
        assert "afval_typen" in data, "Response should contain 'afval_typen' key"
        assert "totaal_afval_typen" in data, "Response should contain 'totaal_afval_typen' key"
        assert isinstance(data["afval_typen"], list), "'afval_typen' should be a list"
        
        print("✓ Model-info endpoint test passed")
        return True
        
    except Exception as e:
        print(f"✗ Model-info endpoint test failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing new API format...")
    
    # Run tests
    test1_passed = test_afval_typen_endpoint()
    test2_passed = test_model_info_endpoint()
    
    if test1_passed and test2_passed:
        print("\n✓ All tests passed!")
    else:
        print("\n✗ Some tests failed!")
        sys.exit(1)