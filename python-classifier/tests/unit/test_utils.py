"""Unit tests for AfvalAlert components"""

import pytest
import torch
from PIL import Image
import io
from src.config.app_config import AppConfig
from src.config.afval_config import AfvalConfig
from src.features.response_validation import validate_gemini_response
from src.features.tensor_processing import extract_tensor_stats, format_feature_description

class TestUtilityFunctions:
    """Unit tests for utility functions"""
    
    def test_extract_tensor_stats(self):
        """Test tensor statistics extraction"""
        # Create test tensor
        tensor = torch.randn(1, 1000)
        stats = extract_tensor_stats(tensor)
        
        # Check all expected keys are present
        expected_keys = ['mean', 'max', 'min', 'std', 'shape']
        for key in expected_keys:
            assert key in stats
        
        # Check value types
        assert isinstance(stats['mean'], float)
        assert isinstance(stats['max'], float)
        assert isinstance(stats['min'], float)
        assert isinstance(stats['std'], float)
        assert isinstance(stats['shape'], str)  # Shape is now a string
    
    def test_validate_gemini_response(self):
        """Test Gemini response validation"""
        valid_types = ['Grofvuil', 'Restafval', 'Glas', 'Papier en karton', 'Organisch', 'Textiel', 'Elektronisch afval', 'Bouw- en sloopafval', 'Chemisch afval', 'Overig', 'Geen afval']
        
        # Test valid response
        response = [
            {'type': 'Glas', 'confidence': 0.9},
            {'type': 'Restafval', 'confidence': 0.1}
        ]
        
        validated = validate_gemini_response(response, valid_types)
        assert len(validated) == 2
        assert all(item['type'] in valid_types for item in validated)
        assert all(0.0 <= item['confidence'] <= 1.0 for item in validated)
        
        # Test filtering of invalid types
        response_with_invalid = [
            {'type': 'Glas', 'confidence': 0.9},
            {'type': 'InvalidType', 'confidence': 0.5}
        ]
        
        validated = validate_gemini_response(response_with_invalid, valid_types)
        assert len(validated) == 1
        assert validated[0]['type'] == 'Glas'
        
        # Test filtering of invalid confidence values
        response_with_invalid_conf = [
            {'type': 'Glas', 'confidence': 1.5},  # Too high
            {'type': 'Restafval', 'confidence': -0.1}  # Too low
        ]
        
        validated = validate_gemini_response(response_with_invalid_conf, valid_types)
        assert len(validated) == 0
    
    def test_format_feature_description(self):
        """Test feature description formatting"""
        stats = {
            'mean': 0.5,
            'max': 1.0,
            'min': 0.0,
            'std': 0.25,
            'shape': '[1, 1000]',
            'range': 1.0,
            'variance': 0.0625,
            'median': 0.5,
            'q25': 0.25,
            'q75': 0.75,
            'positive_ratio': 0.6,
            'negative_ratio': 0.4,
            'high_activation_ratio': 0.3
        }
        
        description = format_feature_description(stats)
        assert isinstance(description, str)
        assert len(description) > 0
        assert 'CONVNEXT BASE MODEL ANALYSE RESULTAAT:' in description
        assert 'Gemiddelde activatie: 0.500' in description

class TestConfiguration:
    """Unit tests for configuration classes"""
    
    def test_app_config_defaults(self):
        """Test AppConfiguration default values"""
        config = AppConfig()
        
        # Check default values
        assert config.max_file_size == 20 * 1024 * 1024  # 20MB in bytes
        assert config.device in ['cuda', 'cpu']
        assert config.model_name == 'convnext_base_384_in22k_ft_in1k'
    
    def test_afval_config_loading(self):
        """Test AfvalConfig loading from YAML"""
        config = AfvalConfig.from_yaml()
        
        # Should have waste types
        assert isinstance(config.afval_types, list)
        assert len(config.afval_types) > 0
        
        # Should have prompt template
        assert isinstance(config.prompt_template, str)
        assert len(config.prompt_template) > 0

if __name__ == "__main__":
    pytest.main([__file__, "-v"])