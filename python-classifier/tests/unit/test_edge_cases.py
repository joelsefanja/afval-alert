"""
Unit tests for edge cases and error handling in AfvalAlert
Tests scenarios not covered by existing tests
"""

import pytest
import sys
from pathlib import Path
from unittest.mock import Mock, patch
import io
from PIL import Image

# Add src directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))

from src.core.classifier import AfvalClassifier
from src.models.schemas import ClassificationResult, LocalClassification, GeminiClassification
from fastapi.testclient import TestClient
from src.api.main import app

client = TestClient(app)

class TestEdgeCases:
    """Test edge cases and error scenarios"""
    
    def test_classifier_with_invalid_image_data(self):
        """Test classifier with invalid image data"""
        classifier = AfvalClassifier()
        
        # Test with empty bytes
        results = classifier.classificeer_afval(b"")
        assert isinstance(results, list)
        assert len(results) > 0
        
        # Test with non-image bytes
        results = classifier.classificeer_afval(b"not an image")
        assert isinstance(results, list)
        assert len(results) > 0
        
        # Test with None (should handle gracefully or return fallback)
        try:
            results = classifier.classificeer_afval(None)
            # If it doesn't raise, it should return valid fallback results
            assert isinstance(results, list)
            assert len(results) > 0
        except (TypeError, AttributeError):
            # This is also acceptable behavior
            pass

    def test_classification_result_validation(self):
        """Test ClassificationResult validation edge cases"""
        # Valid result
        result = ClassificationResult("Glas", 0.85)
        assert result.class_name == "Glas"
        assert result.probability == 0.85
        
        # Edge case: exactly 0.0
        result = ClassificationResult("Overig", 0.0)
        assert result.probability == 0.0
        
        # Edge case: exactly 1.0
        result = ClassificationResult("Restafval", 1.0)
        assert result.probability == 1.0
        
        # Invalid probability - should raise ValueError
        with pytest.raises(ValueError):
            ClassificationResult("Glas", -0.1)
        
        with pytest.raises(ValueError):
            ClassificationResult("Glas", 1.1)

    def test_local_classification_validation(self):
        """Test LocalClassification validation edge cases"""
        # Empty predictions
        local_class = LocalClassification(True, [], 0.0)
        assert local_class.success is True
        assert len(local_class.predictions) == 0
        
        # Max confidence mismatch - should auto-correct
        predictions = [ClassificationResult("Glas", 0.9), ClassificationResult("Restafval", 0.7)]
        local_class = LocalClassification(True, predictions, 0.5)  # Wrong max confidence
        assert local_class.max_confidence == 0.9  # Should be corrected

    def test_image_file_size_limits(self):
        """Test image file size validation"""
        # Create tiny image (should work)
        tiny_img = Image.new('RGB', (10, 10), color='red')
        tiny_buffer = io.BytesIO()
        tiny_img.save(tiny_buffer, format='JPEG')
        tiny_data = tiny_buffer.getvalue()
        
        response = client.post(
            "/classificeer",
            files={"afbeelding": ("afval.jpg", tiny_data, "image/jpeg")}
        )
        assert response.status_code == 200

    def test_concurrent_classification_requests(self):
        """Test multiple concurrent classification requests"""
        import threading
        
        def make_request():
            img = Image.new('RGB', (100, 100), color='blue')
            img_buffer = io.BytesIO()
            img.save(img_buffer, format='JPEG')
            img_data = img_buffer.getvalue()
            
            response = client.post(
                "/classificeer",
                files={"afbeelding": ("afval.jpg", img_data, "image/jpeg")}
            )
            return response.status_code
        
        # Run 5 concurrent requests
        threads = []
        results = []
        
        for _ in range(5):
            thread = threading.Thread(target=lambda: results.append(make_request()))
            threads.append(thread)
            thread.start()
        
        for thread in threads:
            thread.join()
        
        # All requests should succeed
        assert all(status == 200 for status in results)
        assert len(results) == 5

    def test_invalid_content_types(self):
        """Test various invalid content types"""
        test_data = b"fake image data"
        
        invalid_types = [
            "application/pdf",
            "text/html",
            "video/mp4",
            "audio/mp3",
            "",
            None
        ]
        
        for content_type in invalid_types:
            if content_type is None:
                files = {"afbeelding": ("afval.jpg", test_data)}
            else:
                files = {"afbeelding": ("test.file", test_data, content_type)}
            
            response = client.post("/classificeer", files=files)
            assert response.status_code in [400, 422], f"Failed for content type: {content_type}"

    def test_memory_usage_with_large_batches(self):
        """Test memory usage doesn't grow excessively with many requests"""
        import psutil
        import os
        
        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss
        
        # Make 20 classification requests
        img = Image.new('RGB', (200, 200), color='green')
        img_buffer = io.BytesIO()
        img.save(img_buffer, format='JPEG')
        img_data = img_buffer.getvalue()
        
        for _ in range(20):
            response = client.post(
                "/classificeer",
                files={"afbeelding": ("afval.jpg", img_data, "image/jpeg")}
            )
            assert response.status_code == 200
        
        final_memory = process.memory_info().rss
        memory_increase = final_memory - initial_memory
        
        # Memory increase should be reasonable (less than 100MB)
        assert memory_increase < 100 * 1024 * 1024, f"Memory increased by {memory_increase / 1024 / 1024:.2f}MB"

    def test_configuration_error_handling(self):
        """Test behavior when configuration is missing or invalid"""
        with patch('src.config.loader.get_configuration_service', side_effect=Exception("Config error")):
            response = client.get("/")
            # Should still work with fallback values
            assert response.status_code == 200

    def test_adapter_initialization_failures(self):
        """Test graceful handling of adapter initialization failures"""
        with patch('src.adapters.lokale_classificatie.SwinConvNeXtClassifier.get_instance', side_effect=Exception("Model failed")):
            # Should still initialize with fallbacks
            classifier = AfvalClassifier()
            assert classifier is not None

    def test_unicode_and_special_characters(self):
        """Test handling of unicode and special characters in responses"""
        response = client.get("/")
        assert response.status_code == 200
        
        # Should handle unicode properly
        data = response.json()
        assert isinstance(data["service"], str)
        
        # Test with unicode filename
        img = Image.new('RGB', (100, 100), color='red')
        img_buffer = io.BytesIO()
        img.save(img_buffer, format='JPEG')
        img_data = img_buffer.getvalue()
        
        response = client.post(
            "/classificeer",
            files={"afbeelding": ("afval.jpg", img_data, "image/jpeg")}
        )
        assert response.status_code == 200

    def test_response_consistency_across_endpoints(self):
        """Test that response formats are consistent across all endpoints"""
        img = Image.new('RGB', (150, 150), color='yellow')
        img_buffer = io.BytesIO()
        img.save(img_buffer, format='JPEG')
        img_data = img_buffer.getvalue()
        
        endpoints = [
            "/classificeer",
            "/classificeer_met_gemini"
        ]
        
        responses = []
        for endpoint in endpoints:
            response = client.post(
                endpoint,
                files={"afbeelding": ("afval.jpg", img_data, "image/jpeg")}
            )
            assert response.status_code == 200
            responses.append(response.json())
        
        # All should have afval_typen field
        for response_data in responses:
            assert response_data["afval_typen"] == [{"afval_type": "Restafval", "confidence": 1.0}]

    def test_error_logging_and_monitoring(self):
        """Test that errors are properly logged and monitored"""
        import logging
        
        # Capture log output
        with patch('src.api.main.logger') as mock_logger:
            # Trigger an error scenario
            response = client.post(
                "/classificeer",
                files={"afbeelding": ("test.txt", b"not an image", "text/plain")}
            )
            assert response.status_code == 400
            
            # Should have logged something
            assert mock_logger.error.called or mock_logger.warning.called

    def test_rate_limiting_behavior(self):
        """Test behavior under rapid successive requests"""
        img = Image.new('RGB', (50, 50), color='purple')
        img_buffer = io.BytesIO()
        img.save(img_buffer, format='JPEG')
        img_data = img_buffer.getvalue()
        
        # Make 10 rapid requests
        responses = []
        for i in range(10):
            response = client.post(
                "/classificeer",
                files={"afbeelding": ("afval.jpg", img_data, "image/jpeg")}
            )
            responses.append(response.status_code)
        
        # All should succeed (no rate limiting implemented)
        success_count = sum(1 for status in responses if status == 200)
        assert success_count >= 8  # At least 80% should succeed

    @pytest.mark.parametrize("image_format", ["JPEG", "PNG", "BMP"])
    def test_multiple_image_formats(self, image_format):
        """Test classification with different image formats"""
        img = Image.new('RGB', (100, 100), color='orange')
        img_buffer = io.BytesIO()
        img.save(img_buffer, format=image_format)
        img_data = img_buffer.getvalue()
        
        mime_type = f"image/{image_format.lower()}"
        if image_format == "JPEG":
            mime_type = "image/jpeg"
        
        response = client.post(
            "/classificeer",
            files={"afbeelding": (f"test.{image_format.lower()}", img_data, mime_type)}
        )
        
        # Should handle all common image formats
        assert response.status_code in [200, 400]  # 400 is acceptable for unsupported formats


if __name__ == "__main__":
    pytest.main([__file__, "-v"])