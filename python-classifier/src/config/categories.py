"""Afvalcategorieën beheer"""

from typing import Dict, Any
from .loader import get_afval_categorieen, is_geldig_afval_type


def get_afval_categorieen() -> Dict[str, Any]:
    """Verkrijg afvalcategorieën uit configuratie"""
    from .loader import get_configuration_service
    config = get_configuration_service()
    return config.get_waste_categories()


def is_bekend_afval_type(waste_type: str) -> bool:
    """Controleer of afvaltype bekend/geldig is"""
    return is_geldig_afval_type(waste_type)


def get_categorie_info(waste_type: str) -> Dict[str, Any]:
    """Verkrijg gedetailleerde informatie voor een afvalcategorie"""
    if not is_bekend_afval_type(waste_type):
        return {}
    
    categories = get_afval_categorieen()
    return categories.get(waste_type, {})


def get_urgentie_niveau(waste_type: str) -> str:
    """Verkrijg urgentie niveau voor afvaltype"""
    category_info = get_categorie_info(waste_type)
    return category_info.get('urgentie', 'gemiddeld')


def get_dienst_type(waste_type: str) -> str:
    """Verkrijg diensttype voor afvaltype"""
    category_info = get_categorie_info(waste_type)
    return category_info.get('service_type', 'straatveger')


def get_recycling_informatie(waste_type: str) -> str:
    """Verkrijg recyclinginformatie voor afvaltype"""
    category_info = get_categorie_info(waste_type)
    return category_info.get('recycling_mogelijk', '')


# Initiele categories mapping
AFVAL_CATEGORIEEN = get_afval_categorieen()