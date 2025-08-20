# Makefile for AfvalAlert with UV
.PHONY: help install setup test lint format type run develop clean build pre-commit check ci

# Default target
help:
	@echo "AfvalAlert Development Commands (UV-based)"
	@echo "=========================================="
	@echo "setup       - Set up development environment with UV (Development omgeving instellen met UV)"
	@echo "install     - Install dependencies with UV (Dependencies installeren met UV)"
	@echo "test        - Run all tests (Alle tests uitvoeren)"
	@echo "test-unit   - Run unit tests only (Alleen unit tests uitvoeren)"
	@echo "test-integration - Run integration tests only (Alleen integratie tests uitvoeren)"
	@echo "test-e2e    - Run end-to-end tests only (Alleen end-to-end tests uitvoeren)"
	@echo "test-all    - Run all tests with automatic dataset download (Alle tests uitvoeren met automatische dataset download)"
	@echo "lint        - Lint code (Code linten)"
	@echo "format      - Format code with black and isort (Code formatteren met black en isort)"
	@echo "type        - Perform type checking with mypy (Type checking uitvoeren met mypy)"
	@echo "run         - Run development server (Development server uitvoeren)"
	@echo "develop     - Run development server with uvicorn (Development server uitvoeren met uvicorn)"
	@echo "clean       - Clean temporary files (Tijdelijke bestanden opschonen)"
	@echo "build       - Build package (Package bouwen)"

# Set up development environment
setup:
	@echo "Setting up development environment..."
	uv venv
	uv pip install -e ".[dev,test]"
	@echo "Setup complete!"

# Install dependencies
install:
	uv pip install -e ".[dev,test]"

# Run all tests
test:
	uv run python -m pytest tests/ -v --cov=afval_alert --cov-report=term-missing --cov-fail-under=0

# Run unit tests only
test-unit:
	uv run python -m pytest tests/unit/ -v

# Run integration tests only
test-integration:
	uv run python -m pytest tests/integration/ -v

# Run end-to-end tests only
test-e2e:
	uv run python -m pytest tests/e2e/ -v

# Run all tests with automatic dataset download
test-all:
	uv run python scripts/run_all_tests_with_datasets_fixed.py

# Lint code
lint:
	uv run flake8 src/afval_alert/
	uv run black --check src/afval_alert/
	uv run isort --check-only src/afval_alert/

# Format code
format:
	uv run black src/afval_alert/
	uv run isort src/afval_alert/

# Type checking
type:
	uv run mypy src/

# Run development server
run:
	PYTHONPATH=src:. uv run python -m src.api.main --host 0.0.0.0 --port 8000

# Run with uvicorn for development
develop:
	cd src && PYTHONPATH=.. uv run uvicorn api.main:app --reload --host 0.0.0.0 --port 8000

# Alias for develop
dev: develop

# Clean temporary files
clean:
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	find . -type d -name ".mypy_cache" -exec rm -rf {} +
	find . -type f -name ".coverage" -delete

# Build package
build:
	uv build

# Install pre-commit hooks
pre-commit:
	uv run pre-commit install

# Quality check (lint + type + test)
check: lint type test

# CI pipeline
ci: clean install check