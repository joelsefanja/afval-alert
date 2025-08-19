"""
Kernlogica voor afval classificatie

Deze module bevat de hoofdlogica voor het classificeren van zwerfafval
met behulp van lokale AI modellen en Gemini AI.
"""

from abc import ABC, abstractmethod
from typing import Optional, Tuple
import logging
from models.schemas import LocalClassification, GeminiClassification
from adapters.lokale_classificatie import LokaleClassificatieAdapter
from adapters.gemini_ai import GeminiAIAdapter

logger = logging.getLogger(__name__)


class ClassificatieService(ABC):
    """
    Abstracte basis klasse voor classificatie services
    
    Implementeert Dependency Inversion Principle door afhankelijk te zijn
    van abstracties in plaats van concrete implementaties.
    """
    
    @abstractmethod
    def classificeer_lokaal(self, afbeelding_data: bytes) -> LocalClassification:
        """
        Voer lokale classificatie uit
        
        Args:
            afbeelding_data: Bytes van de afbeelding
            
        Returns:
            LocalClassification: Resultaat van lokale classificatie
        """
        pass
    
    @abstractmethod  
    def classificeer_gemini(self, beschrijving: str) -> GeminiClassification:
        """
        Voer Gemini AI classificatie uit
        
        Args:
            beschrijving: Tekstuele beschrijving van de afbeelding
            
        Returns:
            GeminiClassification: Resultaat van Gemini AI analyse
        """
        pass


class AfvalClassificatieRepository:
    """
    Repository voor het behandelen van classificatie verzoeken
    
    Implementeert Single Responsibility Principle - alleen classificatie logica.
    Gebruikt Dependency Injection voor adapters (Dependency Inversion).
    """
    
    def __init__(
        self, 
        lokale_adapter: LokaleClassificatieAdapter, 
        gemini_adapter: GeminiAIAdapter
    ):
        """
        Initialiseer repository met adapters
        
        Args:
            lokale_adapter: Adapter voor lokale AI classificatie
            gemini_adapter: Adapter voor Gemini AI classificatie
        """
        self._lokale_adapter = lokale_adapter
        self._gemini_adapter = gemini_adapter
        self._logger = logging.getLogger(self.__class__.__name__)
    
    def classificeer_lokaal(self, afbeelding_data: bytes) -> LocalClassification:
        """
        Voer lokale classificatie uit met validatie
        
        Args:
            afbeelding_data: Bytes van de afbeelding
            
        Returns:
            LocalClassification: Resultaat van lokale classificatie
            
        Raises:
            ValueError: Als afbeelding data ongeldig is
        """
        if not afbeelding_data:
            raise ValueError("Afbeelding data is leeg")
        
        if not self._lokale_adapter.valideer_afbeelding(afbeelding_data):
            raise ValueError("Afbeelding is niet geldig voor classificatie")
        
        return self._lokale_adapter.classificeer_afbeelding(afbeelding_data)
    
    def classificeer_gemini(self, beschrijving: str) -> GeminiClassification:
        """
        Voer Gemini AI classificatie uit met validatie
        
        Args:
            beschrijving: Tekstuele beschrijving van de afbeelding
            
        Returns:
            GeminiClassification: Resultaat van Gemini AI analyse
            
        Raises:
            ValueError: Als beschrijving ongeldig is
        """
        if not beschrijving or not beschrijving.strip():
            raise ValueError("Beschrijving is leeg")
        
        if not self._gemini_adapter.valideer_tekst(beschrijving):
            raise ValueError("Beschrijving is niet geldig voor Gemini analyse")
        
        return self._gemini_adapter.analyseer_tekst(beschrijving)
    
    def krijg_tekst_beschrijving(self, lokaal_resultaat: LocalClassification) -> str:
        """
        Genereer tekstuele beschrijving van lokaal classificatie resultaat
        
        Args:
            lokaal_resultaat: Resultaat van lokale classificatie
            
        Returns:
            str: Tekstuele beschrijving voor Gemini AI
        """
        return self._lokale_adapter.krijg_tekst_beschrijving(lokaal_resultaat)
    
    def classificeer_volledig(
        self, 
        afbeelding_data: bytes
    ) -> Tuple[LocalClassification, Optional[GeminiClassification]]:
        """
        Voer complete classificatie uit (lokaal + Gemini AI)
        
        Deze methode implementeert de volledige classificatie workflow:
        1. Lokale classificatie van de afbeelding
        2. Tekstuele beschrijving genereren
        3. Gemini AI analyse van de beschrijving
        
        Args:
            afbeelding_data: Bytes van de afbeelding
            
        Returns:
            Tuple[LocalClassification, Optional[GeminiClassification]]:
                Lokale classificatie (altijd), Gemini resultaat (optioneel)
        """
        # Stap 1: Lokale classificatie
        try:
            lokaal_resultaat = self.classificeer_lokaal(afbeelding_data)
        except Exception as e:
            self._logger.error(f"Lokale classificatie gefaald: {e}")
            # Return gefaalde resultaat van lokale classificatie, geen Gemini analyse
            return LocalClassification(
                success=False,
                predictions=[],
                max_confidence=0.0,
                processing_time=0.0
            ), None
        
        # Stap 2: Gemini AI analyse (alleen als lokale classificatie succesvol)
        gemini_resultaat = None
        if lokaal_resultaat.success:
            try:
                beschrijving = self.krijg_tekst_beschrijving(lokaal_resultaat)
                gemini_resultaat = self.classificeer_gemini(beschrijving)
                self._logger.info("Volledige classificatie succesvol voltooid")
            except Exception as e:
                self._logger.warning(f"Gemini classificatie gefaald: {e}")
                # Gemini fout zorgt niet voor dat het hele request faalt
        
        return lokaal_resultaat, gemini_resultaat