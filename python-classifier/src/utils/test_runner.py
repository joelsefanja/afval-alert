"""Test runner for AfvalAlert"""

import sys
import subprocess
import time
from pathlib import Path

class TestRunner:
    """Manages and runs different types of tests"""
    
    def __init__(self, project_root: Path = None):
        if project_root is None:
            project_root = Path(__file__).parent.parent.parent.parent
        
        self.project_root = project_root
        self.tests_dir = project_root / "tests"
    
    def run_unit_tests(self) -> bool:
        """Run unit tests"""
        print("Running Unit Tests...")
        try:
            result = subprocess.run([
                sys.executable, "-m", "pytest", 
                str(self.tests_dir / "unit"),
                "-v", "--tb=short"
            ], capture_output=True, text=True)
            
            print(result.stdout)
            if result.stderr:
                print("STDERR:", result.stderr)
            
            return result.returncode == 0
        except Exception as e:
            print(f"Error running unit tests: {e}")
            return False
    
    def run_integration_tests(self) -> bool:
        """Run integration tests"""
        print("Running Integration Tests...")
        try:
            result = subprocess.run([
                sys.executable, "-m", "pytest", 
                str(self.tests_dir / "integration"),
                "-v", "--tb=short"
            ], capture_output=True, text=True)
            
            print(result.stdout)
            if result.stderr:
                print("STDERR:", result.stderr)
            
            return result.returncode == 0
        except Exception as e:
            print(f"Error running integration tests: {e}")
            return False
    
    def run_e2e_tests(self) -> bool:
        """Run end-to-end tests"""
        print("Running E2E Tests...")
        try:
            result = subprocess.run([
                sys.executable, "-m", "pytest", 
                str(self.tests_dir / "e2e"),
                "-v", "--tb=short"
            ], capture_output=True, text=True)
            
            print(result.stdout)
            if result.stderr:
                print("STDERR:", result.stderr)
            
            return result.returncode == 0
        except Exception as e:
            print(f"Error running e2e tests: {e}")
            return False
    
    def run_all_tests(self) -> bool:
        """Run all test suites"""
        print("=" * 60)
        print("AFVAL-ALERT TEST OMGEVING")
        print("=" * 60)
        
        start_time = time.time()
        
        results = {
            'unit': self.run_unit_tests(),
            'integration': self.run_integration_tests(),
            'e2e': self.run_e2e_tests()
        }
        
        total_time = time.time() - start_time
        
        print("\n" + "=" * 60)
        print("TEST RESULTS SUMMARY")
        print("=" * 60)
        
        for test_type, passed in results.items():
            status = "PASSED" if passed else "FAILED"
            print(f"{test_type.upper():12} : {status}")
        
        all_passed = all(results.values())
        print(f"\nOverall: {'ALL TESTS PASSED' if all_passed else 'SOME TESTS FAILED'}")
        print(f"Total time: {total_time:.2f}s")
        
        return all_passed


def main():
    """Main entry point"""
    runner = TestRunner()
    success = runner.run_all_tests()
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()