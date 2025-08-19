"""Dynamische constanten geladen uit configuratie (SOLID/DRY aanpak)"""

from enum import Enum
from dataclasses import dataclass
from typing import Set, List, Dict, Any
import logging

logger = logging.getLogger(__name__)


def _get_config_service():
    """Lazy import om cirkulaire afhankelijkheden te voorkomen"""
    from config.loader import get_configuration_service
    return get_configuration_service()


class DynamicEnum:
    """Basis klasse voor configuratie-gedreven enums (Open/Closed Principle)"""
    
    @classmethod
    def get_values(cls) -> List[str]:
        """Verkrijg alle enum waarden uit configuratie"""
        raise NotImplementedError("Subklassen moeten get_values implementeren")
    
    @classmethod
    def is_valid(cls, value: str) -> bool:
        """Controleer of waarde geldig is"""
        return value in cls.get_values()


class AfvalType(DynamicEnum):
    """Afvaltype categorieën geladen uit configuratie"""
    
    @classmethod
    def get_values(cls) -> List[str]:
        """Verkrijg afvaltypes uit configuratie"""
        try:
            config = _get_config_service()
            return config.get_waste_type_names()
        except Exception as e:
            logger.error(f"Fout bij laden van afvaltypes: {e}")
            return []


class OpruimDienstType(DynamicEnum):
    """Opruimservice types geladen uit configuratie"""
    
    @classmethod
    def get_values(cls) -> List[str]:
        """Verkrijg service types uit configuratie"""
        try:
            config = _get_config_service()
            return config.get_service_types()
        except Exception as e:
            logger.error(f"Fout bij laden van service types: {e}")
            return []


class UrgentieNiveau(DynamicEnum):
    """Urgentie niveaus geladen uit configuratie"""
    
    @classmethod
    def get_values(cls) -> List[str]:
        """Verkrijg urgentie niveaus uit configuratie"""
        try:
            config = _get_config_service()
            return config.get_urgentie_niveaus()
        except Exception as e:
            logger.error(f"Fout bij laden van urgentie niveaus: {e}")
            return []


@dataclass
class AfvalCategorie:
    """Afvalcategorie definitie geladen uit configuratie"""
    afval_type: str
    dienst_type: str
    urgentie: str
    beschrijving: str
    recycling_mogelijk: str
    opruim_methode: str
    gebruiker_feedback: str
    
    @classmethod
    def from_config(cls, waste_type: str, config_data: Dict[str, Any]) -> 'AfvalCategorie':
        """Maak AfvalCategorie aan vanuit configuratie data"""
        return cls(
            afval_type=waste_type,
            dienst_type=config_data.get('service_type', 'handmatig_opruimen'),
            urgentie=config_data.get('urgency', 'gemiddeld'),
            beschrijving=config_data.get('description', ''),
            recycling_mogelijk=config_data.get('recycling_info', ''),
            opruim_methode=config_data.get('cleanup_method', ''),
            gebruiker_feedback=config_data.get('user_message', '')
        )


class Constants:
    """Configuratie-gedreven constanten (DRY - single source of truth)"""
    
    @staticmethod
    def get_bekende_afval_types() -> Set[str]:
        """Verkrijg bekende afvaltypes uit configuratie"""
        try:
            return set(AfvalType.get_values())
        except Exception as e:
            logger.error(f"Fout bij laden van bekende afvaltypes: {e}")
            return set()
    
    @staticmethod
    def get_api_defaults() -> Dict[str, Any]:
        """Verkrijg API standaardwaarden uit configuratie"""
        try:
            config = _get_config_service()
            return config.get_api_defaults()
        except Exception as e:
            logger.error(f"Fout bij laden van API standaarden: {e}")
            return {}
    
    @staticmethod
    def get_http_status_codes() -> Dict[str, int]:
        """Verkrijg HTTP status codes uit configuratie"""
        try:
            config = _get_config_service()
            constants = config.get_constants()
            return constants.get('http_status_codes', {})
        except Exception as e:
            logger.error(f"Fout bij laden van HTTP status codes: {e}")
            return {}
    
    @staticmethod
    def get_response_message(message_key: str, **kwargs) -> str:
        """Verkrijg responsbericht uit configuratie met formatering"""
        try:
            config = _get_config_service()
            return config.get_response_message(message_key, **kwargs)
        except Exception as e:
            logger.error(f"Fout bij verkrijgen van responsbericht {message_key}: {e}")
            return f"Fout: {message_key}"