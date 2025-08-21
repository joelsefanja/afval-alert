#!/bin/bash
# Setup script for AfvalAlert using UV

set -e

echo "Setting up AfvalAlert development environment with UV..."

# Check if UV is installed
if ! command -v uv &> /dev/null; then
    echo "UV is not installed. Installing UV..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    source $HOME/.local/bin/env
fi

echo "UV found: $(uv --version)"

# Create virtual environment with UV
echo "Creating virtual environment..."
uv venv

# Activate virtual environment
echo "Activating virtual environment..."
source .venv/bin/activate

# Install dependencies with UV
echo "Installing dependencies..."
uv pip install -e ".[dev,test]"

# Verify installation
echo "Verifying installation..."
python -c "import afval_alert; print('Package installed successfully')"

# Run tests
echo "Running tests..."
uv run python -m pytest tests/ -v

echo "Setup complete! Virtual environment activated."
echo "To activate the environment later, run: source .venv/bin/activate"
echo "To run the server: uv run afval-alert server"
echo "To run tests: uv run afval-alert-test"