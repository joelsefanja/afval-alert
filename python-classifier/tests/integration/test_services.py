"""Integration tests for AfvalAlert components"""

import os
import torch
import pytest
from src.services import factory
from src.config.app_config import AppConfig
from src.config.afval_config import AfvalConfig

class TestServiceIntegration:
    """Integration tests for service components"""
    
    def test_factory_creates_all_services(self):
        """Test that factory can create all services"""
        services = factory.create_all_services()
        
        # Check that we got the expected services
        assert "lokaal" in services
        assert "gemini" in services
        assert services["lokaal"].is_ready()
        assert services["gemini"].is_ready()
        
        # Check that services use lazy initialization
        assert services["lokaal"].model is None
        assert services["lokaal"].transform is None
        assert services["lokaal"]._initialized is False
        assert services["gemini"].model is None
        assert services["gemini"]._initialized is False
    
    def test_local_service_initialization(self):
        """Test that local service initializes correctly"""
        service = factory.create_lokale_service()
        assert service.is_ready()
        # Model and transform are lazy loaded, so they should be None initially
        assert service.model is None
        assert service.transform is None
        assert service._initialized is False
    
    @pytest.mark.skipif(not os.getenv("GEMINI_API_KEY"), reason="GEMINI_API_KEY not set")
    def test_gemini_service_initialization(self):
        """Test that Gemini service initializes correctly with API key"""
        service = factory.create_gemini_service()
        assert service.is_ready()
        # Model is lazy loaded, so it should be None initially
        assert service.model is None
        assert service._initialized is False
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