"""
Pytest configuration and fixtures for AfvalAlert tests
Provides common test utilities and setup
"""

import pytest
import os
import sys
from pathlib import Path
from PIL import Image
import io
from unittest.mock import Mock

# Add src directory to Python path for all tests
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

@pytest.fixture
def test_image():
    """Create a standard test image for classification tests"""
    def _create_image(width=200, height=200, color=(255, 0, 0), format='JPEG'):
        image = Image.new('RGB', (width, height), color)
        img_buffer = io.BytesIO()
        image.save(img_buffer, format=format)
        return img_buffer.getvalue()
    return _create_image

@pytest.fixture
def mock_gemini_response():
    """Mock Gemini API response for testing"""
    mock_result = Mock()
    mock_result.is_afval = True
    mock_result.afval_types = [
        {"afval_type": "Restafval", "zekerheid": 0.85},
        {"afval_type": "Glas", "zekerheid": 0.12}
    ]
    mock_result.kenmerken = ["plastic", "container"]
    mock_result.bedank_boodschap = "Bedankt voor het helpen schoonmaken!"
    return mock_result

@pytest.fixture
def mock_local_result():
    """Mock local classification result for testing"""
    from src.models.schemas import ClassificationResult, LocalClassification
    
    predictions = [
        ClassificationResult("Restafval", 0.90),
        ClassificationResult("Glas", 0.08),
        ClassificationResult("Overig", 0.02)
    ]
    return LocalClassification(
        success=True,
        predictions=predictions,
        max_confidence=0.90,
        processing_time=0.15
    )

@pytest.fixture
def sample_waste_categories():
    """Standard waste categories for testing"""
    return [
        "Grofvuil", "Restafval", "Glas", "Papier en karton",
        "Organisch", "Textiel", "Elektronisch afval", 
        "Bouw- en sloopafval", "Chemisch afval", "Overig", "Geen afval"
    ]

@pytest.fixture(autouse=True)
def setup_test_environment():
    """Automatically setup test environment for each test"""
    # Set test environment variables
    os.environ.setdefault("TESTING", "true")
    os.environ.setdefault("LOG_LEVEL", "WARNING")  # Reduce log noise during tests
    
    yield
    
    # Cleanup after test
    if "TESTING" in os.environ:
        del os.environ["TESTING"]

@pytest.fixture
def api_client():
    """FastAPI test client fixture"""
    from fastapi.testclient import TestClient
    from src.api.main import app
    
    return TestClient(app)

@pytest.fixture
def mock_configuration():
    """Mock configuration service for testing"""
    mock_config = Mock()
    mock_config.get_waste_type_names.return_value = [
        "Grofvuil", "Restafval", "Glas", "Papier en karton",
        "Organisch", "Textiel", "Elektronisch afval", 
        "Bouw- en sloopafval", "Chemisch afval", "Overig", "Geen afval"
    ]
    mock_config.get_api_defaults.return_value = {
        "max_bestand_grootte_mb": 50,
        "standaard_top_k": 3,
        "standaard_drempel": 0.5
    }
    mock_config.is_valid_waste_type.return_value = True
    return mock_config

# Pytest markers for test categorization
def pytest_configure(config):
    """Configure pytest with custom markers"""
    config.addinivalue_line(
        "markers", "slow: marks tests as slow (deselect with '-m \"not slow\"')"
    )
    config.addinivalue_line(
        "markers", "integration: marks tests as integration tests"
    )
    config.addinivalue_line(
        "markers", "e2e: marks tests as end-to-end tests"
    )
    config.addinivalue_line(
        "markers", "unit: marks tests as unit tests"
    )
    config.addinivalue_line(
        "markers", "performance: marks tests as performance tests"
    )
    config.addinivalue_line(
        "markers", "gemini: marks tests that require Gemini API key"
    )

def pytest_collection_modifyitems(config, items):
    """Automatically mark tests based on their location and content"""
    for item in items:
        # Auto-mark based on file location
        if "unit" in str(item.fspath):
            item.add_marker(pytest.mark.unit)
        elif "integration" in str(item.fspath):
            item.add_marker(pytest.mark.integration)
        elif "e2e" in str(item.fspath):
            item.add_marker(pytest.mark.e2e)
        
        # Auto-mark slow tests
        if any(keyword in item.name.lower() for keyword in ["slow", "stress", "performance", "concurrent", "memory"]):
            item.add_marker(pytest.mark.slow)
        
        # Auto-mark performance tests
        if "performance" in str(item.fspath) or "performance" in item.name.lower():
            item.add_marker(pytest.mark.performance)
        
        # Auto-mark Gemini tests
        if any(keyword in item.name.lower() for keyword in ["gemini", "real_gemini"]):
            item.add_marker(pytest.mark.gemini)

@pytest.fixture(scope="session")
def skip_if_no_gemini_key():
    """Skip tests if Gemini API key is not available"""
    if not os.getenv("GEMINI_API_KEY"):
        pytest.skip("Gemini API key not available")

# Performance testing utilities
@pytest.fixture
def performance_monitor():
    """Monitor performance metrics during tests"""
    import time
    import psutil
    
    class PerformanceMonitor:
        def __init__(self):
            self.process = psutil.Process()
            self.start_time = None
            self.start_memory = None
        
        def start(self):
            self.start_time = time.time()
            self.start_memory = self.process.memory_info().rss
        
        def stop(self):
            end_time = time.time()
            end_memory = self.process.memory_info().rss
            
            return {
                "duration": end_time - self.start_time if self.start_time else 0,
                "memory_increase": end_memory - self.start_memory if self.start_memory else 0,
                "memory_mb": (end_memory - self.start_memory) / 1024 / 1024 if self.start_memory else 0
            }
    
    return PerformanceMonitor()

# Test data generators
@pytest.fixture
def generate_test_images():
    """Generate various test images for comprehensive testing"""
    def _generator():
        formats = ['JPEG', 'PNG']
        sizes = [(100, 100), (300, 300), (500, 500)]
        colors = [(255, 0, 0), (0, 255, 0), (0, 0, 255), (128, 128, 128)]
        
        for format in formats:
            for width, height in sizes:
                for color in colors:
                    img = Image.new('RGB', (width, height), color)
                    img_buffer = io.BytesIO()
                    img.save(img_buffer, format=format)
                    yield {
                        'data': img_buffer.getvalue(),
                        'format': format,
                        'size': (width, height),
                        'color': color,
                        'filename': f"test_{width}x{height}_{color[0]}_{color[1]}_{color[2]}.{format.lower()}"
                    }
    
    return _generator