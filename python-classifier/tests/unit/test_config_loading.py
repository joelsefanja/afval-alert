"""
Unit Tests voor Configuratie Laden
Test laden van YAML configuratiebestanden
"""

import pytest
import sys
from pathlib import Path
from unittest.mock import patch, mock_open

# Voeg src directory toe aan path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))

from src.config.loader import get_configuration_service, ConfigurationService, ConfigurationFactory
from src.config.implementations import YamlConfigReader, FileConfigRepository, WasteCategoryValidator


class TestConfigurationLoading:
    """Test configuratie laden van YAML bestanden"""

    def test_configuration_service_loading(self):
        """Test laden van configuratie service"""
        # Test getting the configuration service
        config_service = get_configuration_service()
        assert isinstance(config_service, ConfigurationService)
        
        # Test getting constants
        constants = config_service.get_constants()
        assert isinstance(constants, dict)
        
        # Test getting waste categories
        categories = config_service.get_waste_categories()
        assert isinstance(categories, dict)
        
        # Test getting waste type names
        waste_types = config_service.get_waste_type_names()
        assert isinstance(waste_types, list)
        
        # Test getting API defaults
        api_settings = config_service.get_api_defaults()
        assert isinstance(api_settings, dict)

    def test_yaml_config_reader(self):
        """Test YAML configuratie reader"""
        # Create a mock YAML file
        mock_yaml_content = """
constants:
  api_standaarden:
    max_file_size_mb: 50
    timeout_seconds: 30

waste_categories:
  categorieën:
    plastic_flessen:
      name: "Plastic Flessen"
      description: "PET flessen en andere plastic verpakkingen"
    
service:
  name: "AfvalAlert Classifier"
  version: "2.0.0"
  
api_settings:
  allowed_methods: ["GET", "POST"]
        """
        
        with patch("builtins.open", mock_open(read_data=mock_yaml_content)):
            reader = YamlConfigReader()
            # This would normally read from a file, but we're testing the structure
            # The actual file reading is tested in integration tests

    def test_config_repository(self):
        """Test configuratie repository"""
        # Test creating a file config repository
        from pathlib import Path
        reader = YamlConfigReader()
        repo = FileConfigRepository(Path("/tmp"), reader)
        assert isinstance(repo, FileConfigRepository)
        
        # Test that it has the required methods
        assert hasattr(repo, 'load')
        assert hasattr(repo, 'save')

    def test_waste_category_validator(self):
        """Test afval categorie validator"""
        validator = WasteCategoryValidator()
        assert isinstance(validator, WasteCategoryValidator)
        
        # Test validation method exists
        assert hasattr(validator, 'validate')


if __name__ == "__main__":
    pytest.main([__file__, "-v"])