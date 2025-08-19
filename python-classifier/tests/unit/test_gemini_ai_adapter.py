"""
Unit tests for gemini_ai adapter
"""

import pytest
from unittest.mock import Mock, patch
import sys
from pathlib import Path

# Add src directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))

from src.adapters.gemini_ai import GeminiAIAdapter, MockGeminiAI
from src.models.schemas import GeminiClassification


class TestMockGeminiAI:
    """Test MockGeminiAI class"""

    def test_analyseer_afbeelding(self):
        """Test image analysis with mock"""
        mock_gemini = MockGeminiAI()
        
        # Test with fake image data
        result = mock_gemini.analyseer_afbeelding(b"fake_image_data")
        
        # Assertions
        assert isinstance(result, GeminiClassification)
        assert result.is_afval == True
        assert isinstance(result.afval_types, list)
        assert len(result.afval_types) > 0
        assert isinstance(result.kenmerken, list)
        assert len(result.kenmerken) > 0
        assert isinstance(result.bedank_boodschap, str)
        assert "Mock response" in result.bedank_boodschap

    def test_valideer_lokale_resultaten(self):
        """Test validating local results with mock"""
        mock_gemini = MockGeminiAI()
        
        # Test with local predictions
        lokale_voorspellingen = [
            {"type": "plastic_flessen", "zekerheid": 0.95},
            {"type": "blikjes", "zekerheid": 0.15}
        ]
        
        result = mock_gemini.valideer_lokale_resultaten("fake description", lokale_voorspellingen)
        
        # Assertions
        assert isinstance(result, GeminiClassification)
        assert result.is_afval == True
        assert isinstance(result.afval_types, list)
        assert len(result.afval_types) > 0
        assert isinstance(result.kenmerken, list)
        assert len(result.kenmerken) > 0
        assert isinstance(result.bedank_boodschap, str)
        assert "Mock" in result.bedank_boodschap

    def test_valideer_lokale_resultaten_empty_predictions(self):
        """Test validating local results with empty predictions"""
        mock_gemini = MockGeminiAI()
        
        # Test with empty local predictions
        lokale_voorspellingen = []
        
        result = mock_gemini.valideer_lokale_resultaten("fake description", lokale_voorspellingen)
        
        # Assertions
        assert isinstance(result, GeminiClassification)
        assert result.is_afval == True
        assert isinstance(result.afval_types, list)
        assert isinstance(result.kenmerken, list)
        assert isinstance(result.bedank_boodschap, str)
        assert "Mock" in result.bedank_boodschap


class TestGeminiAIAdapter:
    """Test GeminiAIAdapter class"""
    
    @patch('src.adapters.gemini_ai.genai')
    @patch('src.adapters.gemini_ai.GOOGLE_AI_AVAILABLE', True)
    @patch('src.adapters.gemini_ai.Path')
    def test_initialization(self, mock_path, mock_genai):
        """Test adapter initialization"""
        # Mock the model
        mock_model = Mock()
        mock_genai.GenerativeModel.return_value = mock_model
        
        # Mock Path to return a fixed path
        mock_prompts_file = Mock()
        mock_path.return_value.__truediv__.return_value = mock_prompts_file
        
        # Mock the prompts file
        mock_file = mock_open(read_data='''
gemini_prompts:
  image_analysis:
    system_role: "You are an expert in waste classification"
    task_description: "Analyze this image of waste"
    output_format: "Respond in JSON format"
    constraints: "Be concise"
  text_validation:
    system_role: "You are an expert in validating waste classifications"
    task_description: "Validate this classification: {local_description} with predictions: {local_predictions}"
    output_format: "Respond in JSON format"
    constraints: "Be concise"
fallback_responses:
  error:
    is_afval: false
    afval_types: []
    kenmerken: []
    bedank_boodschap: "Sorry, er is een fout opgetreden"
  no_response:
    is_afval: false
    afval_types: []
    kenmerken: []
    bedank_boodschap: "Sorry, geen respons ontvangen"
  validation_fallback:
    is_afval: true
    afval_types: [{"afval_type": "niet_classificeerbaar", "zekerheid": 0.5}]
    kenmerken: ["fallback"]
    bedank_boodschap: "Bedankt voor je geduld"
''')
        
        with patch('builtins.open', mock_file):
            adapter = GeminiAIAdapter("fake_api_key")
            
            # Assertions
            assert adapter.model == mock_model
            mock_genai.configure.assert_called_once_with(api_key="fake_api_key")
            mock_path.assert_called()  # Check that Path was called

    @patch('src.adapters.gemini_ai.GOOGLE_AI_AVAILABLE', False)
    def test_initialization_import_error(self):
        """Test adapter initialization when Google AI is not available"""
        with pytest.raises(ImportError, match="Google Generative AI package is niet geïnstalleerd."):
            GeminiAIAdapter("fake_api_key")

    @patch('src.adapters.gemini_ai.genai')
    @patch('src.adapters.gemini_ai.GOOGLE_AI_AVAILABLE', True)
    @patch('src.adapters.gemini_ai.Path')
    def test_analyseer_afbeelding_success(self, mock_path, mock_genai):
        """Test successful image analysis"""
        # Mock the model and response
        mock_model = Mock()
        mock_genai.GenerativeModel.return_value = mock_model
        mock_response = Mock()
        mock_response.text = '''{
            "is_afval": true,
        "afval_types": [{"afval_type": "plastic_flessen", "zekerheid": 0.9}],
            "kenmerken": ["plastic", "transparant"],
            "bedank_boodschap": "Bedankt voor je melding!"
        }'''
        mock_model.generate_content.return_value = mock_response
        
        # Mock Path to return a fixed path
        mock_prompts_file = Mock()
        mock_path.return_value.__truediv__.return_value = mock_prompts_file
        
        # Mock the prompts file
        mock_file = mock_open(read_data='''
gemini_prompts:
  image_analysis:
    system_role: "You are an expert in waste classification"
    task_description: "Analyze this image of waste"
    output_format: "Respond in JSON format"
    constraints: "Be concise"
  text_validation:
    system_role: "You are an expert in validating waste classifications"
    task_description: "Validate this classification: {local_description} with predictions: {local_predictions}"
    output_format: "Respond in JSON format"
    constraints: "Be concise"
fallback_responses:
  error:
    is_afval: false
    afval_types: []
    kenmerken: []
    bedank_boodschap: "Sorry, er is een fout opgetreden"
  no_response:
    is_afval: false
    afval_types: []
    kenmerken: []
    bedank_boodschap: "Sorry, geen respons ontvangen"
  validation_fallback:
    is_afval: true
    afval_types: [{"afval_type": "niet_classificeerbaar", "zekerheid": 0.5}]
    kenmerken: ["fallback"]
    bedank_boodschap: "Bedankt voor je geduld"
''')
        
        with patch('builtins.open', mock_file):
            adapter = GeminiAIAdapter("fake_api_key")
            
            # Test
            result = adapter.analyseer_afbeelding(b"fake_image_data")
            
            # Assertions
            assert isinstance(result, GeminiClassification)
            assert result.is_afval == True
            assert len(result.afval_types) == 1
            assert result.afval_types[0]["afval_type"] == "plastic_flessen"
            assert result.afval_types[0]["zekerheid"] == 0.9
            assert result.kenmerken == ["plastic", "transparant"]
            assert result.bedank_boodschap == "Bedankt voor je melding!"

    @patch('src.adapters.gemini_ai.genai')
    @patch('src.adapters.gemini_ai.GOOGLE_AI_AVAILABLE', True)
    @patch('src.adapters.gemini_ai.Path')
    def test_valideer_lokale_resultaten_success(self, mock_path, mock_genai):
        """Test successful validation of local results"""
        # Mock the model and response
        mock_model = Mock()
        mock_genai.GenerativeModel.return_value = mock_model
        mock_response = Mock()
        mock_response.text = '''{
            "is_afval": true,
            "afval_types": [{"afval_type": "plastic_flessen", "zekerheid": 0.9}],
            "kenmerken": ["plastic", "transparant"],
            "bedank_boodschap": "Bedankt voor je melding!"
        }'''
        mock_model.generate_content.return_value = mock_response
        
        # Mock Path to return a fixed path
        mock_prompts_file = Mock()
        mock_path.return_value.__truediv__.return_value = mock_prompts_file
        
        # Mock the prompts file
        mock_file = mock_open(read_data='''
gemini_prompts:
  image_analysis:
    system_role: "You are an expert in waste classification"
    task_description: "Analyze this image of waste"
    output_format: "Respond in JSON format"
    constraints: "Be concise"
  text_validation:
    system_role: "You are an expert in validating waste classifications"
    task_description: "Validate this classification: {local_description} with predictions: {local_predictions}"
    output_format: "Respond in JSON format"
    constraints: "Be concise"
fallback_responses:
  error:
    is_afval: false
    afval_types: []
    kenmerken: []
    bedank_boodschap: "Sorry, er is een fout opgetreden"
  no_response:
    is_afval: false
    afval_types: []
    kenmerken: []
    bedank_boodschap: "Sorry, geen respons ontvangen"
  validation_fallback:
    is_afval: true
    afval_types: [{"afval_type": "niet_classificeerbaar", "zekerheid": 0.5}]
    kenmerken: ["fallback"]
    bedank_boodschap: "Bedankt voor je geduld"
''')
        
        with patch('builtins.open', mock_file):
            adapter = GeminiAIAdapter("fake_api_key")
            
            # Test data
            lokale_beschrijving = "Gedetecteerd: plastic_flessen (95.0%)"
            lokale_voorspellingen = [
                {"type": "plastic_flessen", "zekerheid": 0.95},
                {"type": "blikjes", "zekerheid": 0.15}
            ]
            
            # Test
            result = adapter.valideer_lokale_resultaten(lokale_beschrijving, lokale_voorspellingen)
            
            # Assertions
            assert isinstance(result, GeminiClassification)
            assert result.is_afval == True
            assert len(result.afval_types) == 1
            assert result.afval_types[0]["afval_type"] == "plastic_flessen"
            assert result.afval_types[0]["zekerheid"] == 0.9
            assert result.kenmerken == ["plastic", "transparant"]
            assert result.bedank_boodschap == "Bedankt voor je melding!"


# Mock open function for YAML file reading
def mock_open(read_data=None):
    """Mock open function for testing"""
    mock_file = Mock()
    mock_file.read.return_value = read_data
    mock_file.__enter__ = Mock(return_value=mock_file)
    mock_file.__exit__ = Mock(return_value=None)
    mock_open_func = Mock(return_value=mock_file)
    return mock_open_func


if __name__ == "__main__":
    pytest.main([__file__, "-v"])