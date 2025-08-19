"""Hoofd toegangspunt voor AfvalAlert CLI"""

import sys
import argparse

def main():
    """Hoofd toegangspunt"""
    parser = argparse.ArgumentParser(description="AfvalAlert - Dutch Waste Classification Service")
    parser.add_argument("--version", action="version", version="AfvalAlert 2.0.0")
    
    subparsers = parser.add_subparsers(dest="command", help="Beschikbare commando's")
    
    # Server commando
    server_parser = subparsers.add_parser("server", help="Start de API server")
    server_parser.add_argument("--host", default="0.0.0.0", help="Host om aan te binden")
    server_parser.add_argument("--port", type=int, default=8000, help="Poort om aan te binden")
    server_parser.add_argument("--reload", action="store_true", help="Schakel auto-herladen in")
    
    # Test commando
    test_parser = subparsers.add_parser("test", help="Voer tests uit")
    test_parser.add_argument("--type", choices=["unit", "integration", "e2e", "all"], 
                           default="all", help="Type tests om uit te voeren")
    
    args = parser.parse_args()
    
    if args.command == "server":
        from .api.main import main as server_main
        server_main()
    elif args.command == "test":
        from .utils.test_runner import TestRunner
        runner = TestRunner()
        
        if args.type == "unit":
            success = runner.run_unit_tests()
        elif args.type == "integration":
            success = runner.run_integration_tests()
        elif args.type == "e2e":
            success = runner.run_e2e_tests()
        else:
            success = runner.run_all_tests()
        
        sys.exit(0 if success else 1)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()