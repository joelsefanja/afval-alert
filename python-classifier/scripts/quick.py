#!/usr/bin/env python3
"""
QUICK TEST RUNNER
================

Simple Windows-friendly test runner with GUI menu.
For command line users, use: ../test
"""

import subprocess
import sys
from pathlib import Path

def run_test(test_type, image_path=None):
    """Run test via main test runner"""
    main_test = Path(__file__).parent / "run_all_tests_with_datasets_fixed.py"
    
    try:
        print(f"Starting {test_type} tests...")
        print("=" * 40)
        
        cmd = [sys.executable, str(main_test), test_type]
        if image_path:
            cmd.append(image_path)
        result = subprocess.run(cmd, capture_output=True, text=True)
        return result.returncode == 0
    except Exception as e:
        print(f"Error: {e}")
        return False

def download_datasets():
    """Download datasets using the new download script"""
    download_script = Path(__file__).parent / "download_specific_datasets.py"
    
    try:
        print("Starting dataset download...")
        print("=" * 40)
        
        result = subprocess.run([sys.executable, str(download_script)])
        return result.returncode == 0
    except Exception as e:
        print(f"Error: {e}")
        return False

def main(image_path=None):
    """Simple GUI-style menu"""
    print("AFVAL-ALERT QUICK TEST RUNNER")
    print("==============================")
    print("Windows-friendly version")
    if image_path:
        print(f"Using image: {image_path}")
    print()
    print("Choose option:")
    print("1. Unit tests      - Fast (< 2s) - RECOMMENDED")
    print("2. Integration     - With API")
    print("3. Docker          - Container tests (slow)")
    print("4. E2E             - End-to-end tests")
    print("5. All tests       - Everything")
    print("6. Download datasets - Get 100+ images")
    print()
    print("For command line: use ../test instead")
    print()
    
    while True:
        choice = input("Enter choice (1-6) or 'q' to quit: ").strip().lower()
        
        if choice == 'q':
            return True
        
        test_map = {
            "1": "unit",
            "2": "integration", 
            "3": "docker",
            "4": "e2e",
            "5": "all"
        }
        
        if choice in test_map:
            success = run_test(test_map[choice], image_path)
            print()
            if success:
                print("Tests completed successfully!")
            else:
                print("Some tests failed.")
            print()
            
            continue_choice = input("Run more tests? (y/n): ").strip().lower()
            if continue_choice != 'y':
                return success
        elif choice == "6":
            success = download_datasets()
            print()
            if success:
                print("Dataset download completed!")
            else:
                print("Dataset download failed.")
            print()
            
            continue_choice = input("Do something else? (y/n): ").strip().lower()
            if continue_choice != 'y':
                return success
        else:
            print("Invalid choice. Please enter 1-6 or 'q'.")

if __name__ == "__main__":
    try:
        success = main(sys.argv[1] if len(sys.argv) > 1 else None)
        input("\nPress Enter to exit...")
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\nCancelled by user")
        sys.exit(1)