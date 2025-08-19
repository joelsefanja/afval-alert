"""Configuratie implementaties volgens SOLID en DRY principes

Deze module bevat concrete implementaties van de configuratie interfaces
voor verschillende bronnen zoals YAML, JSON en in-memory caching.
"""

import yaml
import json
from pathlib import Path
from typing import Dict, Any, List, Optional
import logging
from datetime import datetime, timedelta

from .interfaces import ConfigReader, ConfigValidator, ConfigTransformer, ConfigRepository, ConfigCache

logger = logging.getLogger(__name__)


class YamlConfigReader(ConfigReader):
    """YAML bestand configuratie lezer
    
    Implementeert ConfigReader interface voor het lezen van YAML configuratiebestanden.
    Ondersteunt UTF-8 encoding en graceful error handling.
    """
    
    def read(self, source: str) -> Dict[str, Any]:
        """Lees YAML configuratie uit bestand
        
        Args:
            source: Pad naar het YAML configuratiebestand
            
        Returns:
            Dict[str, Any]: Geladen configuratiegegevens of lege dict bij fout
            
        Note:
            Bij fouten wordt een lege dictionary geretourneerd en wordt de fout gelogd.
        """
        try:
            path = Path(source)
            if not path.exists():
                logger.warning(f"Configuratiebestand niet gevonden: {source}")
                return {}
                
            with open(path, 'r', encoding='utf-8') as f:
                return yaml.safe_load(f) or {}
                
        except Exception as e:
            logger.error(f"Fout tijdens het lezen van YAML configuratiebestand {source}: {e}")
            return {}


class JsonConfigReader(ConfigReader):
    """JSON bestand configuratie lezer
    
    Implementeert ConfigReader interface voor het lezen van JSON configuratiebestanden.
    Ondersteunt UTF-8 encoding en heeft eenvoudige foutafhandeling.
    """
    
    def read(self, source: str) -> Dict[str, Any]:
        """Lees JSON configuratie uit bestand
        
        Args:
            source: Pad naar het JSON configuratiebestand
            
        Returns:
            Dict[str, Any]: Geladen configuratiegegevens of lege dict bij fout
            
        Note:
            Bij fouten wordt een lege dictionary geretourneerd en wordt de fout gelogd.
        """
        try:
            path = Path(source)
            if not path.exists():
                logger.warning(f"Configuratiebestand niet gevonden: {source}")
                return {}
                
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
                
        except Exception as e:
            logger.error(f"Fout tijdens het lezen van JSON configuratiebestand {source}: {e}")
            return {}


class BaseConfigValidator(ConfigValidator):
    """Basis configuratie validator met gemeenschappelijke validatielogica
    
    Abstracte basis klasse die algemene validatiefunctionaliteit implementeert
    en kan worden uitgebreid voor specifieke configuratietypes.
    """
    
    def __init__(self):
        self._errors: List[str] = []
    
    def validate(self, config: Dict[str, Any]) -> bool:
        """Valideer configuratiestructuur
        
        Args:
            config: Te valideren configuratie dictionary
            
        Returns:
            bool: True als configuratie geldig is, anders False
            
        Note:
            Roept _validate_specific aan voor subklasse-specifieke validatie.
        """
        self._errors.clear()
        
        if not isinstance(config, dict):
            self._errors.append("Configuratie moet een dictionary zijn")
            return False
            
        return self._validate_specific(config)
    
    def get_errors(self) -> List[str]:
        """Krijg validatiefouten van laatste validatie
        
        Returns:
            List[str]: Kopie van de lijst met foutmeldingen
        """
        return self._errors.copy()
    
    def _validate_specific(self, config: Dict[str, Any]) -> bool:
        """Override in subklassen voor specifieke validatie
        
        Args:
            config: Te valideren configuratie
            
        Returns:
            bool: True als specifieke validatie slaagt
        """
        return True
    
    def _require_key(self, config: Dict[str, Any], key: str, value_type: type = None) -> bool:
        """Helper om verplichte sleutel te controleren met optionele type check
        
        Args:
            config: Configuratie dictionary om te controleren
            key: Verplichte sleutelnaam
            value_type: Optioneel verwacht type van de waarde
            
        Returns:
            bool: True als sleutel aanwezig is en juist type heeft
        """
        if key not in config:
            self._errors.append(f"Verplichte sleutel ontbreekt: {key}")
            return False
            
        if value_type and not isinstance(config[key], value_type):
            self._errors.append(f"Sleutel {key} moet van type {value_type.__name__} zijn")
            return False
            
        return True


class WasteCategoryValidator(BaseConfigValidator):
    """Validator voor afvalcategorie configuratie
    
    Specifieke validator die de structuur en inhoud van
    afvalcategorie configuraties valideert volgens Nederlandse
    afval classificatie standaarden.
    """
    
    def _validate_specific(self, config: Dict[str, Any]) -> bool:
        """Valideer afvalcategorie configuratiestructuur
        
        Args:
            config: Afvalcategorie configuratie om te valideren
            
        Returns:
            bool: True als alle categorieën geldige structuur hebben
            
        Note:
            Controleert verplichte velden per categorie en hun types.
        """
        valid = True
        
        # Validate top-level structure
        if not self._require_key(config, 'categories', dict):
            return False
            
        categories = config['categories']
        
        # Validate each category
        for cat_name, cat_config in categories.items():
            if not isinstance(cat_config, dict):
                self._errors.append(f"Categorie {cat_name} moet een dictionary zijn")
                valid = False
                continue
                
            # Required fields for each category
            required_fields = [
                ('name', str),
                ('description', str),
                ('service_type', str),
                ('urgentie_niveau', str),
                ('recycling_info', str)
            ]
            
            for field, field_type in required_fields:
                if not self._require_key(cat_config, field, field_type):
                    valid = False
        
        return valid


class MemoryConfigCache(ConfigCache):
    """In-memory configuratie cache met TTL ondersteuning
    
    Implementeert caching van configuraties in het geheugen met
    automatische verloopdatums (TTL) voor efficiënte toegang.
    """
    
    def __init__(self):
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._ttl: Dict[str, datetime] = {}
    
    def get(self, key: str) -> Optional[Dict[str, Any]]:
        """Haal gecachte configuratie op
        
        Args:
            key: Sleutel van de configuratie
            
        Returns:
            Optional[Dict[str, Any]]: Gecachte configuratie of None als
                                     niet aanwezig of verlopen
            
        Note:
            Controleert automatisch TTL en verwijdert verlopen items.
        """
        if key not in self._cache:
            return None
            
        # Check TTL
        if key in self._ttl and datetime.now() > self._ttl[key]:
            self.invalidate(key)
            return None
            
        return self._cache[key].copy()
    
    def set(self, key: str, config: Dict[str, Any], ttl: Optional[int] = None) -> None:
        """Zet configuratie in cache met optionele TTL
        
        Args:
            key: Sleutel voor de configuratie
            config: Te cachen configuratiegegevens (wordt gekopieerd)
            ttl: Time-to-live in seconden (optioneel)
            
        Note:
            Maakt een kopie van de configuratie om mutatie te voorkomen.
        """
        self._cache[key] = config.copy()
        
        if ttl:
            self._ttl[key] = datetime.now() + timedelta(seconds=ttl)
        elif key in self._ttl:
            del self._ttl[key]
    
    def invalidate(self, key: str) -> None:
        """Maak gecachte configuratie ongeldig
        
        Args:
            key: Sleutel van te invalideren configuratie
            
        Note:
            Verwijdert zowel de configuratie als eventuele TTL informatie.
        """
        self._cache.pop(key, None)
        self._ttl.pop(key, None)
    
    def clear(self) -> None:
        """Wis alle gecachte configuraties
        
        Verwijdert alle configuraties en TTL informatie uit de cache.
        Nuttig voor geheugen cleanup en testing.
        """
        self._cache.clear()
        self._ttl.clear()


class FileConfigRepository(ConfigRepository):
    """Bestand-gebaseerde configuratie repository (uitbreidbaar naar DB)
    
    Implementeert ConfigRepository interface voor opslag van configuraties
    in YAML bestanden. Kan in de toekomst uitgebreid worden naar databases.
    """
    
    def __init__(self, base_path: Path, reader: ConfigReader):
        self.base_path = Path(base_path)
        self.reader = reader
        self.base_path.mkdir(parents=True, exist_ok=True)
    
    def load(self, key: str) -> Optional[Dict[str, Any]]:
        """Laad configuratie op basis van sleutel
        
        Args:
            key: Configuratiesleutel (gebruikt als bestandsnaam)
            
        Returns:
            Optional[Dict[str, Any]]: Geladen configuratie of None als niet gevonden
        """
        file_path = self.base_path / f"{key}.yaml"
        
        if not file_path.exists():
            return None
            
        return self.reader.read(str(file_path))
    
    def save(self, key: str, config: Dict[str, Any]) -> bool:
        """Sla configuratie op onder gegeven sleutel
        
        Args:
            key: Configuratiesleutel (gebruikt als bestandsnaam)
            config: Te bewaren configuratiegegevens
            
        Returns:
            bool: True als opslaan succesvol was, anders False
            
        Note:
            Slaat op als YAML bestand met UTF-8 encoding.
        """
        try:
            file_path = self.base_path / f"{key}.yaml"
            
            with open(file_path, 'w', encoding='utf-8') as f:
                yaml.dump(config, f, default_flow_style=False, allow_unicode=True)
                
            return True
            
        except Exception as e:
            logger.error(f"Fout bij opslaan van configuratie {key}: {e}")
            return False
    
    def exists(self, key: str) -> bool:
        """Controleer of configuratie bestaat
        
        Args:
            key: Te controleren configuratiesleutel
            
        Returns:
            bool: True als configuratiebestand bestaat
        """
        file_path = self.base_path / f"{key}.yaml"
        return file_path.exists()
    
    def list_keys(self) -> List[str]:
        """Lijst alle beschikbare configuratiesleutels
        
        Returns:
            List[str]: Lijst van configuratiesleutels (bestandsnamen zonder .yaml)
        """
        return [f.stem for f in self.base_path.glob("*.yaml")]


class DefaultTransformer(ConfigTransformer):
    """Standaard configuratie transformer (passthrough)
    
    Basis implementatie die configuratie ongewijzigd doorgeeft.
    Kan uitgebreid worden voor specifieke transformaties.
    """
    
    def transform(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Standaard transformatie (geen wijziging)
        
        Args:
            config: Te transformeren configuratie
            
        Returns:
            Dict[str, Any]: Kopie van de originele configuratie
        """
        return config.copy()


class DatabaseConfigRepository(ConfigRepository):
    """Database configuratie repository (toekomstige implementatie)
    
    Placeholder voor toekomstige database-gebaseerde configuratieopslag.
    Momenteel niet geïmplementeerd.
    """
    
    def __init__(self, connection_string: str):
        self.connection_string = connection_string
        # TODO: Initialiseer database connectie
        raise NotImplementedError("Database repository nog niet geïmplementeerd")
    
    def load(self, key: str) -> Optional[Dict[str, Any]]:
        """Laad configuratie uit database
        
        Args:
            key: Configuratiesleutel
            
        Returns:
            Optional[Dict[str, Any]]: Geladen configuratie
            
        Raises:
            NotImplementedError: Database repository nog niet geïmplementeerd
        """
        # TODO: Implementeer database laden
        raise NotImplementedError()
    
    def save(self, key: str, config: Dict[str, Any]) -> bool:
        """Sla configuratie op in database
        
        Args:
            key: Configuratiesleutel  
            config: Te bewaren configuratie
            
        Returns:
            bool: True als opslaan succesvol was
            
        Raises:
            NotImplementedError: Database repository nog niet geïmplementeerd
        """
        # TODO: Implementeer database opslaan
        raise NotImplementedError()
    
    def exists(self, key: str) -> bool:
        """Controleer of configuratie bestaat in database
        
        Args:
            key: Te controleren configuratiesleutel
            
        Returns:
            bool: True als configuratie bestaat
            
        Raises:
            NotImplementedError: Database repository nog niet geïmplementeerd
        """
        # TODO: Implementeer database bestaat controle
        raise NotImplementedError()
    
    def list_keys(self) -> List[str]:
        """Lijst alle configuratiesleutels uit database
        
        Returns:
            List[str]: Lijst van beschikbare configuratiesleutels
            
        Raises:
            NotImplementedError: Database repository nog niet geïmplementeerd
        """
        # TODO: Implementeer database sleutel lijst
        raise NotImplementedError()