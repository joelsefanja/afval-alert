# Zwerfafval Classifier Makefile

.PHONY: help install dev test build clean docker-build docker-run docker-dev docker-down

help:
	@echo "Available commands:"
	@echo "  install     - Install dependencies with uv"
	@echo "  dev         - Run development server"
	@echo "  test        - Run tests"
	@echo "  test-unit   - Run unit tests only"
	@echo "  test-e2e    - Run e2e tests only"
	@echo "  build       - Build the application"
	@echo "  clean       - Clean cache and temporary files"
	@echo "  docker-build - Build Docker image"
	@echo "  docker-run   - Run with Docker Compose (production)"
	@echo "  docker-dev   - Run with Docker Compose (development)"
	@echo "  docker-down  - Stop Docker services"

install:
	cd classifier && pip install --upgrade pip uv && uv pip install -e .

dev:
	cd classifier && uvicorn main:app --reload --host 0.0.0.0 --port 8000

test:
	cd classifier && python -m pytest tests/ -v

test-unit:
	cd classifier && python -m pytest tests/test_unit.py -v

test-e2e:
	cd classifier && python -m pytest tests/test_e2e.py -v

test-integration:
	cd classifier && python -m pytest tests/test_integration.py -v

test-manual:
	cd classifier && python tests/test_manual.py

test-download:
	cd classifier/tests/assets && python download_real_images.py

build:
	cd classifier && pip install --upgrade pip uv && uv pip install -e .

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +

docker-build:
	docker-compose build

docker-run:
	docker-compose up -d

docker-dev:
	docker-compose -f docker-compose.dev.yml up

docker-down:
	docker-compose down
	docker-compose -f docker-compose.dev.yml down

docker-logs:
	docker-compose logs -f classifier-apiminikube-start:
	minikube start --driver=docker

minikube-deploy: minikube-start
	# Set Docker environment to Minikube's Docker daemon
	eval $$(minikube docker-env)
	
	# Build the Docker image
	cd classifier && docker build -t afval-alert:latest .
	
	# Update deployment.yaml with the correct image name
	sed -i 's|YOUR_ARTIFACT_REGISTRY/afval-alert:latest|afval-alert:latest|g' k8s/deployment.yaml
	sed -i 's|YOUR_DOMAIN|afval-alert.local|g' k8s/deployment.yaml
	
	# Apply Kubernetes configurations
	kubectl apply -f k8s/
	
	# Wait for deployment to be ready
	kubectl rollout status deployment/afval-alert
	
	# Show deployment status
	kubectl get pods
	kubectl get services

minikube-stop:
	minikube stop

minikube-delete:
	minikube delete