# Makefile for AfvalAlert Python Classifier with UV
.PHONY: help dev test lint format type run clean build check docs

# Default target
help:
	@echo "AfvalAlert Python Classifier - UV Development Commands"
	@echo "====================================================="
	@echo "dev         - 🚀 ONE COMMAND: Setup + Run development server"
	@echo "             (Installs dependencies and starts server with reload)"
	@echo ""
	@echo "Other Commands:"
	@echo "test        - Run all tests with coverage"
	@echo "test-unit   - Run unit tests only"
	@echo "test-integration - Run integration tests only"
	@echo "test-e2e    - Run end-to-end tests only"
	@echo "lint        - Lint code with flake8, black, isort"
	@echo "format      - Format code with black and isort"
	@echo "type        - Type checking with mypy"
	@echo "run         - Run main controller server"
	@echo "run-legacy  - Run legacy API server"
	@echo "clean       - Clean temporary files and caches"
	@echo "build       - Build package"
	@echo "check       - Full quality check (lint + type + test)"
	@echo "docs        - Generate/update documentation"

# ONE COMMAND: Setup + Run development server
dev:
	@echo "Starting AfvalAlert Development Server..."
	@echo "Installing dependencies with UV..."
	@uv pip install -e ".[dev,test]" --quiet
	@echo "Dependencies installed!"
	@echo "Starting server at http://localhost:8001"
	@echo "API docs at http://localhost:8001/docs"
	@echo "Auto-reload enabled - edit files and see changes instantly!"
	uv run uvicorn src.controller:app --reload --host 127.0.0.1 --port 8001

# Run all tests
test:
	uv run python -m pytest tests/ -v --cov=src --cov-report=term-missing --cov-fail-under=80

# Run unit tests only
test-unit:
	uv run python -m pytest tests/unit/ -v

# Run integration tests only
test-integration:
	uv run python -m pytest tests/integration/ -v

# Run end-to-end tests only
test-e2e:
	uv run python -m pytest tests/e2e/ -v


# Lint code
lint:
	uv run flake8 src/
	uv run black --check src/
	uv run isort --check-only src/

# Format code
format:
	uv run black src/
	uv run isort src/

# Type checking
type:
	uv run mypy src/

# Run main controller server
run:
	uv run python -m src.controller

# Run legacy API server
run-legacy:
	uv run python -m src.main


# Clean temporary files
clean:
	-find . -type f -name "*.pyc" -delete
	-find . -type d -name "__pycache__" -delete
	-find . -type d -name "*.egg-info" -exec rm -rf {} +
	-find . -type d -name ".pytest_cache" -exec rm -rf {} +
	-find . -type d -name ".mypy_cache" -exec rm -rf {} +
	-find . -type f -name ".coverage" -delete
	-find . -type f -name ".DS_Store" -delete
	-rm -rf dist/

# Build package
build:
	uv build

# Generate/update documentation
docs:
	@echo "Updating project documentation..."
	@echo "Project structure documented in docs/ARCHITECTURE_V3.md"

# Quality check (lint + type + test)
check: lint type test

# CI pipeline
ci: clean install check