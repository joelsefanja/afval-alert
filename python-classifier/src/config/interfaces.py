"""Configuratie interfaces volgens SOLID principes

Deze module definieert abstracte interfaces voor configuratiebeheer
volgens de SOLID ontwerpprincipes voor uitbreidbaarheid en onderhoud.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from pathlib import Path


class ConfigReader(ABC):
    """Interface voor het lezen van configuratiegegevens (Open/Closed Principe)
    
    Abstracte basis klasse die het lezen van configuratie uit verschillende bronnen
    mogelijk maakt zonder de bestaande code te wijzigen.
    """
    
    @abstractmethod
    def read(self, source: str) -> Dict[str, Any]:
        """Lees configuratie van een bron
        
        Args:
            source: Pad naar het configuratiebestand of bron identifier
            
        Returns:
            Dict[str, Any]: Gelezen configuratiegegevens als dictionary
            
        Raises:
            FileNotFoundError: Als het bestand niet gevonden kan worden
            ValueError: Als de configuratie niet geldig is
        """
        pass


class ConfigValidator(ABC):
    """Interface voor het valideren van configuratie (Single Responsibility Principe)
    
    Verantwoordelijk voor alleen het valideren van configuratiestructuren
    en waarden volgens gedefinieerde regels.
    """
    
    @abstractmethod
    def validate(self, config: Dict[str, Any]) -> bool:
        """Valideer configuratiestructuur en waarden
        
        Args:
            config: Te valideren configuratie dictionary
            
        Returns:
            bool: True als configuratie geldig is, anders False
        """
        pass
    
    @abstractmethod
    def get_errors(self) -> List[str]:
        """Krijg validatiefouten van laatste validatie
        
        Returns:
            List[str]: Lijst van foutmeldingen gevonden tijdens validatie
        """
        pass


class ConfigTransformer(ABC):
    """Interface voor het transformeren van configuratiegegevens
    
    Verantwoordelijk voor het omzetten van rauwe configuratiegegevens
    naar het interne formaat van de applicatie.
    """
    
    @abstractmethod
    def transform(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Transformeer configuratie naar intern formaat
        
        Args:
            config: Rauwe configuratiegegevens
            
        Returns:
            Dict[str, Any]: Getransformeerde configuratie voor intern gebruik
        """
        pass


class ConfigRepository(ABC):
    """Interface voor configuratiepersistentie (toekomstige DB integratie)
    
    Abstracte interface die opslag en ophaling van configuraties mogelijk
    maakt via verschillende backends (bestanden, databases, etc.).
    """
    
    @abstractmethod
    def load(self, key: str) -> Optional[Dict[str, Any]]:
        """Laad configuratie op basis van sleutel
        
        Args:
            key: Unieke identificatie voor de configuratie
            
        Returns:
            Optional[Dict[str, Any]]: Configuratiegegevens of None als niet gevonden
        """
        pass
    
    @abstractmethod
    def save(self, key: str, config: Dict[str, Any]) -> bool:
        """Sla configuratie op onder gegeven sleutel
        
        Args:
            key: Unieke identificatie voor de configuratie
            config: Te bewaren configuratiegegevens
            
        Returns:
            bool: True als opslaan succesvol was, anders False
        """
        pass
    
    @abstractmethod
    def exists(self, key: str) -> bool:
        """Controleer of configuratie bestaat
        
        Args:
            key: Te controleren configuratiesleutel
            
        Returns:
            bool: True als configuratie bestaat, anders False
        """
        pass
    
    @abstractmethod
    def list_keys(self) -> List[str]:
        """Lijst alle beschikbare configuratiesleutels
        
        Returns:
            List[str]: Lijst van alle beschikbare configuratiesleutels
        """
        pass


class ConfigCache(ABC):
    """Interface voor configuratie caching
    
    Verantwoordelijk voor het tijdelijk opslaan van configuraties
    in het geheugen voor snellere toegang en verminderde I/O.
    """
    
    @abstractmethod
    def get(self, key: str) -> Optional[Dict[str, Any]]:
        """Haal gecachte configuratie op
        
        Args:
            key: Sleutel van de te ophalen configuratie
            
        Returns:
            Optional[Dict[str, Any]]: Gecachte configuratie of None als niet aanwezig/verlopen
        """
        pass
    
    @abstractmethod
    def set(self, key: str, config: Dict[str, Any], ttl: Optional[int] = None) -> None:
        """Zet configuratie in cache met optionele TTL
        
        Args:
            key: Sleutel voor de configuratie
            config: Te cachen configuratiegegevens
            ttl: Time-to-live in seconden (optioneel)
        """
        pass
    
    @abstractmethod
    def invalidate(self, key: str) -> None:
        """Maak gecachte configuratie ongeldig
        
        Args:
            key: Sleutel van te invalideren configuratie
        """
        pass
    
    @abstractmethod
    def clear(self) -> None:
        """Wis alle gecachte configuraties
        
        Verwijdert alle configuraties uit de cache.
        """
        pass