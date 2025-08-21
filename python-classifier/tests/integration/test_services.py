"""Integration tests for AfvalAlert components"""

import os
import torch
import pytest
from src.services import factory
from src.utils import AppConfig, AfvalConfig

class TestServiceIntegration:
    """Integration tests for service components"""
    
    def test_factory_creates_all_services(self):
        """Test that factory can create all services"""
        services = factory.create_all_services()
        
        assert 'lokaal' in services
        assert 'gemini' in services
        # Check that we get service instances (can't check exact type due to singleton decorator)
        assert hasattr(services['lokaal'], 'is_ready')
        
        # Gemini service may or may not be available depending on API key
        if os.getenv("GEMINI_API_KEY"):
            assert hasattr(services['gemini'], 'is_ready')
    
    def test_local_service_initialization(self):
        """Test that local service initializes correctly"""
        service = factory.create_lokale_service()
        assert service.is_ready()
        assert service.model is not None
        assert service.transform is not None
    
    @pytest.mark.skipif(not os.getenv("GEMINI_API_KEY"), reason="GEMINI_API_KEY not set")
    def test_gemini_service_initialization(self):
        """Test that Gemini service initializes correctly with API key"""
        service = factory.create_gemini_service()
        assert service.is_ready()
        assert service.model is not None
        assert len(service.config.afval_types) > 0

class TestConfigurationIntegration:
    """Integration tests for configuration system"""
    
    def test_configuration_loading(self):
        """Test that configuration loads correctly"""
        config = AfvalConfig.from_yaml()
        
        # Should have waste types
        assert len(config.afval_types) > 0
        
        # Should have prompt template
        assert config.prompt_template != ""
    
    def test_app_configuration(self):
        """Test that app configuration loads correctly"""
        config = AppConfig()
        
        # Should have default values
        assert config.max_file_size > 0
        assert config.device in ['cuda', 'cpu']

if __name__ == "__main__":
    pytest.main([__file__, "-v"])