# Setup script for AfvalAlert using UV (Windows PowerShell)

Write-Host "Setting up AfvalAlert development environment with UV..." -ForegroundColor Green

# Check if UV is installed
if (-not (Get-Command uv -ErrorAction SilentlyContinue)) {
    Write-Host "UV is not installed. Installing UV..." -ForegroundColor Red
    irm https://astral.sh/uv/install.ps1 | iex
    $env:PATH += ";$env:USERPROFILE\.local\bin"
}

Write-Host "UV found: $(uv --version)" -ForegroundColor Green

# Create virtual environment with UV
Write-Host "Creating virtual environment..." -ForegroundColor Blue
uv venv

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Blue
.\.venv\Scripts\Activate.ps1

# Install dependencies with UV
Write-Host "Installing dependencies..." -ForegroundColor Blue
uv pip install -e ".[dev,test]"

# Verify installation
Write-Host "Verifying installation..." -ForegroundColor Blue
python -c "import afval_alert; print('Package installed successfully')"

# Run tests
Write-Host "Running tests..." -ForegroundColor Blue
uv run python -m pytest tests/ -v

Write-Host "Setup complete! Virtual environment activated." -ForegroundColor Green
Write-Host "To activate the environment later, run: .\.venv\Scripts\Activate.ps1" -ForegroundColor Yellow
Write-Host "To run the server: uv run afval-alert server" -ForegroundColor Yellow
Write-Host "To run tests: uv run afval-alert-test" -ForegroundColor Yellow