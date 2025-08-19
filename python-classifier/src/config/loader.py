"""SOLID en DRY Configuratiebeheersysteem"""

from pathlib import Path
from typing import Dict, Any, List, Optional, Union
import logging

from .interfaces import ConfigReader, ConfigValidator, ConfigRepository, ConfigCache
from .implementations import (
    YamlConfigReader, JsonConfigReader, MemoryConfigCache, 
    FileConfigRepository, WasteCategoryValidator, DefaultTransformer
)

logger = logging.getLogger(__name__)


class ConfigurationService:
    """
    Hoofdconfiguratieservice volgens SOLID principes:
    - Single Responsibility: Coördineert configuratiebewerkingen
    - Open/Closed: Uitbreidbaar via dependency injection
    - Liskov Substitution: Gebruikt interfaces voor alle afhankelijkheden
    - Interface Segregation: Gerichte interfaces voor elk belang
    - Dependency Inversion: Afhankelijk van abstracties, niet van concrete implementaties
    """
    
    def __init__(
        self,
        repository: ConfigRepository,
        cache: Optional[ConfigCache] = None,
        validator: Optional[ConfigValidator] = None
    ):
        self.repository = repository
        self.cache = cache or MemoryConfigCache()
        self.validator = validator
        self._config_keys = [
            'app_config'
        ]
    
    def get_config(self, key: str, use_cache: bool = True) -> Dict[str, Any]:
        """
        Verkrijg configuratie op basis van sleutel met caching ondersteuning
        Implementeert DRY principe - enkele methode voor alle configuratie ophalen
        """
        # Probeer eerst cache
        if use_cache:
            cached = self.cache.get(key)
            if cached is not None:
                logger.debug(f"{key} uit cache opgehaald")
                return cached
        
        # Laad van repository
        config = self.repository.load(key)
        if config is None:
            logger.warning(f"Configuratie {key} niet gevonden")
            return {}
        
        # Valideer indien validator beschikbaar
        if self.validator and not self.validator.validate(config):
            logger.error(f"Configuratie {key} validatie mislukt: {self.validator.get_errors()}")
            return {}
        
        # Cache het resultaat
        if use_cache:
            self.cache.set(key, config, ttl=3600)  # 1 uur TTL
            logger.debug(f"{key} gecached")
        
        return config
    
    def get_waste_categories(self) -> Dict[str, Any]:
        """Verkrijg afvalcategorieën configuratie"""
        return self.get_config('app_config').get('categories', {})

    def get_constants(self) -> Dict[str, Any]:
        """Verkrijg applicatie constanten"""
        return self.get_config('app_config')

    def get_waste_type_names(self) -> List[str]:
        """Verkrijg lijst van alle afvaltype namen (DRY - single source of truth)"""
        config = self.get_config('app_config')
        return list(config.get('zwerfafval_typen', {}).keys())

    def get_urgentie_niveaus(self) -> List[str]:
        """Verkrijg lijst van urgentie niveaus"""
        config = self.get_config('app_config')
        return list(config.get('urgentie_niveaus', {}).keys())

    def get_service_types(self) -> List[str]:
        """Verkrijg lijst van opruimservice types"""
        config = self.get_config('app_config')
        return list(config.get('service_capabilities', {}).keys())

    def get_categorie_info(self, waste_type: str) -> Dict[str, Any]:
        """Verkrijg gedetailleerde informatie voor een specifieke afvalcategorie"""
        config = self.get_config('app_config')
        categories = config.get('categorieën', {})
        return categories.get(waste_type, {})

    def get_api_defaults(self) -> Dict[str, Any]:
        """Verkrijg API standaardinstellingen"""
        config = self.get_config('app_config')
        return config.get('api', {})
    
    def get_response_message(self, message_key: str, **kwargs) -> str:
        """Verkrijg geformatteerd responsbericht (DRY - gecentraliseerde berichten)"""
        constants = self.get_constants()
        messages = constants.get('response_berichten', {})
        message = messages.get(message_key, f"Onbekend bericht: {message_key}")
        
        try:
            return message.format(**kwargs)
        except KeyError as e:
            logger.error(f"Ontbrekende formatparameter voor bericht {message_key}: {e}")
            return message
            
    def get_service_info(self) -> Dict[str, Any]:
        """Verkrijg service informatie"""
        config = self.get_config('classifier_config')
        return config.get('service', {})
        
    def get_model_info(self) -> Dict[str, Any]:
        """Verkrijg model informatie"""
        config = self.get_config('classifier_config')
        return config.get('model', {})
        
    def get_performance_settings(self) -> Dict[str, Any]:
        """Verkrijg prestatie instellingen"""
        config = self.get_config('classifier_config')
        return config.get('performance', {})
    
    def is_valid_waste_type(self, waste_type: str) -> bool:
        """Controleer of afvaltype geldig is (DRY - single validation point)"""
        return waste_type in self.get_waste_type_names()
    
    def reload_config(self, key: str) -> bool:
        """Herlaad configuratie en wis cache"""
        self.cache.invalidate(key)
        config = self.get_config(key, use_cache=False)
        return bool(config)
    
    def reload_all(self) -> bool:
        """Herlaad alle configuraties"""
        self.cache.clear()
        success = True
        
        for key in self._config_keys:
            if not self.reload_config(key):
                success = False
                
        return success


class ConfigurationFactory:
    """Factory voor het aanmaken van configuratieservices met verschillende backends"""

    @staticmethod
    def create_file_based(
        config_dir: Optional[Path] = None,
        use_validation: bool = True,
        test_mode: bool = False
    ) -> ConfigurationService:
        """Maak bestand-gebaseerde configuratieservice aan"""
        if config_dir is None:
            config_dir = Path(__file__).parent / "data"

        reader = YamlConfigReader()
        config_file = "test_config.yaml" if test_mode else "app_config.yaml"
        repository = FileConfigRepository(config_dir, reader)
        cache = MemoryConfigCache()
        validator = WasteCategoryValidator() if use_validation else None

        return ConfigurationService(repository, cache, validator)
    
    @staticmethod
    def create_database_based(
        connection_string: str,
        use_validation: bool = True
    ) -> ConfigurationService:
        """Maak database-gebaseerde configuratieservice aan (toekomstig)"""
        # TODO: Implementeer wanneer database repository gereed is
        raise NotImplementedError("Database configuratieservice nog niet geïmplementeerd")


# Global service instance (Singleton pattern)
_config_service: Optional[ConfigurationService] = None


def get_configuration_service() -> ConfigurationService:
    """Verkrijg globale configuratieservice instance"""
    global _config_service
    if _config_service is None:
        _config_service = ConfigurationFactory.create_file_based()
    return _config_service


def reset_configuration_service() -> None:
    """Reset globale configuratieservice (nuttig voor testen)"""
    global _config_service
    _config_service = None


# Gemak functies voor achterwaartse compatibiliteit en gebruiksgemak
def get_afval_categorieen() -> Dict[str, Any]:
    """Verkrijg afvalcategorieën"""
    return get_configuration_service().get_waste_categories()


def get_constanten() -> Dict[str, Any]:
    """Verkrijg applicatie constanten"""
    return get_configuration_service().get_constants()


def is_geldig_afval_type(waste_type: str) -> bool:
    """Controleer of afvaltype geldig is"""
    return get_configuration_service().is_valid_waste_type(waste_type)