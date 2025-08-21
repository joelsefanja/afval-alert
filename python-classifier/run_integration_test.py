#!/usr/bin/env python3
"""
Simple integration test that demonstrates the complete AfvalAlert system workflow.
This script shows how all components work together by running the actual test suite.
"""

import subprocess
import sys

def run_test_suite():
    """Run the complete test suite to demonstrate system integration"""
    print("Running AfvalAlert Complete System Integration Tests")
    print("=" * 60)
    
    # Run unit tests
    print("\n1. Running Unit Tests...")
    result = subprocess.run([
        sys.executable, "-m", "pytest", "tests/unit/", "-v"
    ], capture_output=True, text=True)
    
    if result.returncode == 0:
        print("   OK All unit tests passed")
    else:
        print("   FAIL Unit tests failed")
        print(result.stdout)
        print(result.stderr)
        return False
    
    # Run integration tests
    print("\n2. Running Integration Tests...")
    result = subprocess.run([
        sys.executable, "-m", "pytest", "tests/integration/", "-v"
    ], capture_output=True, text=True)
    
    if result.returncode == 0:
        print("   OK All integration tests passed")
    else:
        print("   FAIL Integration tests failed")
        print(result.stdout)
        print(result.stderr)
        return False
    
    # Run end-to-end tests
    print("\n3. Running End-to-End Tests...")
    result = subprocess.run([
        sys.executable, "-m", "pytest", "tests/e2e/", "-v"
    ], capture_output=True, text=True)
    
    if result.returncode == 0:
        print("   OK All end-to-end tests passed")
    else:
        print("   FAIL End-to-end tests failed")
        print(result.stdout)
        print(result.stderr)
        return False
    
    print("\n" + "=" * 60)
    print("All integration tests completed successfully!")
    print("\nThis demonstrates that all components of the AfvalAlert system work together:")
    print(" Unit tests verify individual components")
    print(" Integration tests verify component interactions")
    print(" End-to-end tests verify complete system functionality")
    return True

if __name__ == "__main__":
    success = run_test_suite()
    sys.exit(0 if success else 1)