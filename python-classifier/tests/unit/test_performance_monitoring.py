"""
Performance monitoring and benchmarking tests for AfvalAlert
Tests response times, memory usage, and system performance
"""

import pytest
import time
import psutil
import os
import sys
from pathlib import Path
from unittest.mock import patch, Mock
import io
from PIL import Image
import threading

# Add src directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))

from fastapi.testclient import TestClient
from src.api.main import app
from src.core.classifier import AfvalClassifier

client = TestClient(app)

class TestPerformanceMonitoring:
    """Performance monitoring and benchmarking tests"""
    
    def create_test_image(self, width=200, height=200, color=(255, 0, 0)):
        """Create a test image with specified dimensions"""
        image = Image.new('RGB', (width, height), color)
        img_buffer = io.BytesIO()
        image.save(img_buffer, format='JPEG')
        return img_buffer.getvalue()

    def test_response_time_baseline(self):
        """Establish baseline response times for classification endpoints"""
        test_image = self.create_test_image()
        
        # Test hybrid endpoint
        start_time = time.time()
        response = client.post(
            "/classificeer",
            files={"afbeelding": ("afval.jpg", test_image, "image/jpeg")}
        )
        hybrid_time = time.time() - start_time
        
        assert response.status_code == 200
        assert hybrid_time < 5.0  # Should complete within 5 seconds
        
        # Test Gemini endpoint
        start_time = time.time()
        response = client.post(
            "/classificeer_met_gemini",
            files={"afbeelding": ("afval.jpg", test_image, "image/jpeg")}
        )
        gemini_time = time.time() - start_time
        
        assert response.status_code == 200
        assert gemini_time < 10.0  # Gemini might be slower
        
        print(f"Hybrid endpoint: {hybrid_time:.3f}s")
        print(f"Gemini endpoint: {gemini_time:.3f}s")

    def test_memory_usage_single_request(self):
        """Monitor memory usage for single classification request"""
        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss
        
        test_image = self.create_test_image(500, 500)  # Larger image
        
        response = client.post(
            "/classificeer",
            files={"afbeelding": ("afval.jpg", test_image, "image/jpeg")}
        )
        
        peak_memory = process.memory_info().rss
        memory_increase = peak_memory - initial_memory
        
        assert response.status_code == 200
        
        # Memory increase should be reasonable (less than 50MB for single request)
        memory_mb = memory_increase / 1024 / 1024
        assert memory_mb < 50, f"Memory increased by {memory_mb:.2f}MB"
        
        print(f"Memory increase: {memory_mb:.2f}MB")

    def test_concurrent_request_performance(self):
        """Test performance under concurrent load"""
        test_image = self.create_test_image(300, 300)
        num_threads = 5
        results = []
        errors = []
        
        def make_request():
            try:
                start_time = time.time()
                response = client.post(
                    "/classificeer",
                    files={"afbeelding": ("afval.jpg", test_image, "image/jpeg")}
                )
                end_time = time.time()
                
                results.append({
                    'status': response.status_code,
                    'time': end_time - start_time
                })
            except Exception as e:
                errors.append(str(e))
        
        # Start concurrent requests
        threads = []
        overall_start = time.time()
        
        for _ in range(num_threads):
            thread = threading.Thread(target=make_request)
            threads.append(thread)
            thread.start()
        
        # Wait for all threads
        for thread in threads:
            thread.join()
        
        overall_time = time.time() - overall_start
        
        # Analyze results
        assert len(errors) == 0, f"Errors occurred: {errors}"
        assert len(results) == num_threads
        
        successful_requests = [r for r in results if r['status'] == 200]
        assert len(successful_requests) == num_threads
        
        avg_response_time = sum(r['time'] for r in results) / len(results)
        max_response_time = max(r['time'] for r in results)
        
        print(f"Concurrent requests: {num_threads}")
        print(f"Overall time: {overall_time:.3f}s")
        print(f"Average response time: {avg_response_time:.3f}s")
        print(f"Max response time: {max_response_time:.3f}s")
        
        # Performance assertions
        assert avg_response_time < 10.0  # Average should be reasonable
        assert max_response_time < 15.0  # Max should be acceptable

    def test_image_size_impact_on_performance(self):
        """Test how image size affects performance"""
        sizes = [(100, 100), (300, 300), (600, 600), (1000, 1000)]
        performance_data = []
        
        for width, height in sizes:
            test_image = self.create_test_image(width, height)
            image_size_mb = len(test_image) / 1024 / 1024
            
            start_time = time.time()
            response = client.post(
                "/classificeer",
                files={"afbeelding": ("afval.jpg", test_image, "image/jpeg")}
            )
            processing_time = time.time() - start_time
            
            assert response.status_code == 200
            
            performance_data.append({
                'dimensions': f"{width}x{height}",
                'size_mb': image_size_mb,
                'time': processing_time
            })
        
        # Print performance data
        print("Image Size vs Performance:")
        for data in performance_data:
            print(f"  {data['dimensions']}: {data['size_mb']:.2f}MB -> {data['time']:.3f}s")
        
        # Performance should not degrade too much with larger images
        smallest_time = performance_data[0]['time']
        largest_time = performance_data[-1]['time']
        time_ratio = largest_time / smallest_time
        
        assert time_ratio < 5.0, f"Large image took {time_ratio:.2f}x longer than small image"

    def test_classifier_initialization_time(self):
        """Test how long it takes to initialize the classifier"""
        start_time = time.time()
        classifier = AfvalClassifier()
        init_time = time.time() - start_time
        
        assert classifier is not None
        assert init_time < 5.0, f"Classifier initialization took {init_time:.3f}s"
        
        print(f"Classifier initialization time: {init_time:.3f}s")

    def test_repeated_classifications_performance(self):
        """Test performance of repeated classifications (caching behavior)"""
        test_image = self.create_test_image(250, 250)
        times = []
        
        # Make 10 repeated requests
        for i in range(10):
            start_time = time.time()
            response = client.post(
                "/classificeer",
                files={"afbeelding": ("afval.jpg", test_image, "image/jpeg")}
            )
            end_time = time.time()
            
            assert response.status_code == 200
            times.append(end_time - start_time)
        
        # Analyze performance trends
        first_request_time = times[0]
        avg_subsequent_time = sum(times[1:]) / len(times[1:])
        
        print(f"First request: {first_request_time:.3f}s")
        print(f"Average subsequent: {avg_subsequent_time:.3f}s")
        
        # Subsequent requests might be faster due to model warmup
        # But they shouldn't be dramatically different
        performance_ratio = first_request_time / avg_subsequent_time
        assert 0.5 <= performance_ratio <= 3.0, "Performance inconsistency detected"

    def test_memory_leak_detection(self):
        """Test for memory leaks over multiple requests"""
        process = psutil.Process(os.getpid())
        test_image = self.create_test_image(200, 200)
        
        # Baseline memory
        baseline_memory = process.memory_info().rss
        
        # Make 20 requests
        for i in range(20):
            response = client.post(
                "/classificeer",
                files={"afbeelding": ("afval.jpg", test_image, "image/jpeg")}
            )
            assert response.status_code == 200
        
        # Check memory after requests
        final_memory = process.memory_info().rss
        memory_increase = final_memory - baseline_memory
        memory_increase_mb = memory_increase / 1024 / 1024
        
        print(f"Memory increase after 20 requests: {memory_increase_mb:.2f}MB")
        
        # Memory increase should be bounded
        assert memory_increase_mb < 100, f"Potential memory leak detected: {memory_increase_mb:.2f}MB increase"

    @pytest.mark.slow
    def test_stress_test_rapid_requests(self):
        """Stress test with rapid consecutive requests"""
        test_image = self.create_test_image(150, 150)
        num_requests = 50
        failures = 0
        total_time = 0
        
        start_time = time.time()
        
        for i in range(num_requests):
            try:
                request_start = time.time()
                response = client.post(
                    "/classificeer",
                    files={"afbeelding": ("afval.jpg", test_image, "image/jpeg")}
                )
                request_end = time.time()
                
                if response.status_code != 200:
                    failures += 1
                
                total_time += (request_end - request_start)
                
            except Exception as e:
                failures += 1
                print(f"Request {i} failed: {e}")
        
        end_time = time.time()
        overall_time = end_time - start_time
        success_rate = ((num_requests - failures) / num_requests) * 100
        avg_response_time = total_time / (num_requests - failures) if failures < num_requests else 0
        
        print(f"Stress Test Results:")
        print(f"  Total requests: {num_requests}")
        print(f"  Failures: {failures}")
        print(f"  Success rate: {success_rate:.1f}%")
        print(f"  Overall time: {overall_time:.3f}s")
        print(f"  Avg response time: {avg_response_time:.3f}s")
        
        # Success rate should be reasonable under stress
        assert success_rate >= 90.0, f"Success rate too low under stress: {success_rate:.1f}%"
        assert avg_response_time < 2.0, f"Average response time too high: {avg_response_time:.3f}s"

    def test_endpoint_comparison_performance(self):
        """Compare performance between different endpoints"""
        test_image = self.create_test_image(200, 200)
        endpoints = [
            "/classificeer",
            "/classificeer_met_gemini",
            "/api/v2/classify"
        ]
        
        results = {}
        
        for endpoint in endpoints:
            times = []
            for _ in range(5):  # Test each endpoint 5 times
                start_time = time.time()
                response = client.post(
                    endpoint,
                    files={"afbeelding": ("afval.jpg", test_image, "image/jpeg")}
                )
                end_time = time.time()
                
                assert response.status_code == 200
                times.append(end_time - start_time)
            
            avg_time = sum(times) / len(times)
            results[endpoint] = avg_time
        
        print("Endpoint Performance Comparison:")
        for endpoint, avg_time in results.items():
            print(f"  {endpoint}: {avg_time:.3f}s")
        
        # All endpoints should complete within reasonable time
        for endpoint, avg_time in results.items():
            assert avg_time < 10.0, f"Endpoint {endpoint} too slow: {avg_time:.3f}s"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])