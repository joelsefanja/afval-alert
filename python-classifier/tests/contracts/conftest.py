"""Pytest configuratie voor contract tests"""

import pytest
import httpx
from fastapi.testclient import TestClient
from src.controller import app


@pytest.fixture
def test_client():
    """Test client voor API contract tests"""
    return TestClient(app)


@pytest.fixture
async def async_test_client():
    """Async test client voor API contract tests"""
    async with httpx.AsyncClient(app=app, base_url="http://test") as client:
        yield client


@pytest.fixture
def sample_image_bytes():
    """Sample afbeelding voor testing"""
    # Minimale JPEG header voor testing
    return (
        b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00'
        b'\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t'
        b'\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a'
        b'\x1f\x1e\x1d\x1a\x1c\x1c $.\' \",#\x1c\x1c(7),01444\x1f\'9=82'
        b'<.342\xff\xc0\x00\x11\x08\x00\x01\x00\x01\x01\x01\x11\x00\x02'
        b'\x11\x01\x03\x11\x01\xff\xc4\x00\x14\x00\x01\x00\x00\x00\x00'
        b'\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x08\xff\xda\x00'
        b'\x08\x01\x01\x00\x00?\x00\xaa\xff\xd9'
    )


@pytest.fixture
def sample_classifications():
    """Sample classificatie resultaten"""
    return [
        {"type": "Glas", "confidence": 0.95},
        {"type": "Restafval", "confidence": 0.85}
    ]


@pytest.fixture
def sample_debug_response():
    """Sample debug response"""
    return {
        "pipeline_steps": {
            "preprocessing": {"duration": 0.1, "status": "completed"},
            "model_inference": {"duration": 0.5, "status": "completed"},
            "postprocessing": {"duration": 0.05, "status": "completed"}
        },
        "classification": [
            {"type": "Glas", "confidence": 0.95}
        ],
        "processing_time": 0.65
    }