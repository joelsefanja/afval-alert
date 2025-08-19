"""
Kernlogica voor afval classificatie

Deze module bevat de hoofdlogica voor het classificeren van zwerfafval:
- ClassificatieService: Abstracte interface voor classificatie services
- AfvalClassificatieRepository: Concrete implementatie van classificatie logica
"""

from .classification import ClassificatieService, AfvalClassificatieRepository

__all__ = [
    'ClassificatieService',
    'AfvalClassificatieRepository'
]