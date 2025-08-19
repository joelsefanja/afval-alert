# Configuratie Systeem

## Overzicht

AfvalAlert gebruikt een volledig configuratie-gedreven architectuur. Alle constanten, instellingen en afval categorieën worden geladen uit YAML bestanden in plaats van hardcoded in de source code.

## Architectuur

### SOLID Configuratie Design

Het configuratie systeem volgt alle SOLID principes:

1. **Single Responsibility**: Elke klasse heeft één verantwoordelijkheid
2. **Open/Closed**: Uitbreidbaar zonder code wijzigingen  
3. **Liskov Substitution**: Interfaces zijn vervangbaar
4. **Interface Segregation**: Gefocuste interfaces
5. **Dependency Inversion**: Afhankelijk van abstracties

### Project Structuur

```
src/afval_alert/config/
├── interfaces.py      # Abstracte interfaces
├── implementations.py # Concrete implementaties
├── loader.py          # Hoofdconfiguratie service
├── factories.py       # Creational patterns
└── data/              # YAML configuratie bestanden
    ├── afval_categories.yaml
    ├── constants.yaml
    └── classifier_config.yaml
```

## Core Componenten

### Configuratie Interfaces

#### ConfigReader
Interface voor het lezen van configuratie uit verschillende bronnen:

```python
class ConfigReader(ABC):
    @abstractmethod
    def read(self, source: str) -> Dict[str, Any]:
        """Lees configuratie van een bron"""
        pass
```

#### ConfigRepository  
Interface voor configuratiepersistentie:

```python
class ConfigRepository(ABC):
    @abstractmethod
    def load(self, key: str) -> Optional[Dict[str, Any]]:
        """Laad configuratie op basis van sleutel"""
        pass
```

#### ConfigCache
Interface voor configuratie caching:

```python
class ConfigCache(ABC):
    @abstractmethod
    def get(self, key: str) -> Optional[Dict[str, Any]]:
        """Haal gecachte configuratie op"""
        pass
```

### Concrete Implementaties

#### YamlConfigReader
Leest YAML configuratiebestanden:

```python
class YamlConfigReader(ConfigReader):
    def read(self, source: str) -> Dict[str, Any]:
        """Lees YAML configuratie uit bestand"""
        with open(source, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f) or {}
```

#### FileConfigRepository
Persisteert configuratie in bestanden:

```python
class FileConfigRepository(ConfigRepository):
    def load(self, key: str) -> Optional[Dict[str, Any]]:
        """Laad configuratie uit YAML bestand"""
        file_path = self.base_path / f"{key}.yaml"
        return self.reader.read(str(file_path))
```

#### MemoryConfigCache
Cachet configuratie in het geheugen:

```python
class MemoryConfigCache(ConfigCache):
    def get(self, key: str) -> Optional[Dict[str, Any]]:
        """Haal gecachte configuratie op met TTL controle"""
        # Automatische TTL controle en cleanup
        if key in self._ttl and datetime.now() > self._ttl[key]:
            self.invalidate(key)
            return None
        return self._cache[key].copy()
```

## Configuratie Bestanden

### constants.yaml
Alle applicatie constanten:

```yaml
afval_typen:
  plastic_flessen: "plastic_flessen"
  blikjes: "blikjes" 
  glazen_flessen: "glazen_flessen"
  papier_karton: "papier_karton"

opruim_dienst_typen:
  straatveger: "straatveger"
  handmatig_opruimen: "handmatig_opruimen"

urgentie_niveaus:
  laag: "laag"
  gemiddeld: "gemiddeld"
  hoog: "hoog"
  urgent: "urgent"

api_standaarden:
  max_bestand_grootte_mb: 50
  timeout_seconden: 30

model_standaarden:
  input_grootte: [299, 299, 3]
  betrouwbaarheid_drempel: 0.5
```

### afval_categories.yaml
Afval categorie definities:

```yaml
categorieën:
  plastic_flessen:
    naam: "Plastic Flessen"
    beschrijving: "PET flessen, drankflessen, shampooflessen"
    service_type: "handmatig_opruimen"
    urgentie: "gemiddeld"
    recycling_info: "Hoog recycleerbaar - tot 10x herbruikbaar"
```

## Gebruik

### Basis Gebruik

```python
from afval_alert.config.loader import get_configuration_service

# Verkrijg configuratie service
config = get_configuration_service()

# Verkrijg afval typen
valid_types = config.get_waste_type_names()

# Verkrijg API standaarden
api_defaults = config.get_api_defaults()

# Verkrijg afval categorieën
categories = config.get_waste_categories()
```

### Geavanceerd Gebruik

```python
# Factory pattern voor verschillende backends
from afval_alert.config.loader import ConfigurationFactory

# Bestand-gebaseerd (standaard)
file_config = ConfigurationFactory.create_file_based()

# Database-gebaseerd (toekomstig)
# db_config = ConfigurationFactory.create_database_based("connection_string")

# Met of zonder validatie
config_with_validation = ConfigurationFactory.create_file_based(use_validation=True)
config_without_validation = ConfigurationFactory.create_file_based(use_validation=False)
```

### Caching

Het configuratie systeem heeft ingebouwde caching met TTL:

```python
# Configuratie wordt automatisch gecached met 1 uur TTL
categories = config.get_waste_categories()  # Van schijf
categories = config.get_waste_categories()  # Van cache

# Forceer herladen
config.reload_config('waste_categories')  # Wis cache en herlaad
```

### Validatie

Configuratie wordt automatisch gevalideerd:

```python
class WasteCategoryValidator(BaseConfigValidator):
    def _validate_specific(self, config: Dict[str, Any]) -> bool:
        """Valideer afvalcategorie configuratiestructuur"""
        # Controleer verplichte velden
        required_fields = [
            ('naam', str),
            ('beschrijving', str),
            ('service_type', str),
            ('urgentie', str),
            ('recycling_info', str)
        ]
        
        for field, field_type in required_fields:
            if not self._require_key(cat_config, field, field_type):
                valid = False
```

## Extensibility

### Nieuwe Configuratie Types

Voeg eenvoudig nieuwe configuratie types toe:

```python
# 1. Voeg toe aan constants.yaml
afval_typen:
  nieuw_type: "nieuw_type"

# 2. Geen code wijzigingen nodig!
#    Bestaande code werkt automatisch

# 3. Gebruik overal
valid_types = config.get_waste_type_names()  # Inclusief nieuw_type
```

### Nieuwe Backends

Implementeer nieuwe backends via interfaces:

```python
class DatabaseConfigRepository(ConfigRepository):
    """Toekomstige database implementatie"""
    def load(self, key: str) -> Optional[Dict[str, Any]]:
        # Database query logica
        pass
    
    def save(self, key: str, config: Dict[str, Any]) -> bool:
        # Database opslag logica
        pass
```

### Nieuwe Validatoren

Voeg custom validatie toe:

```python
class CustomConfigValidator(BaseConfigValidator):
    def _validate_specific(self, config: Dict[str, Any]) -> bool:
        """Custom validatie logica"""
        # Business rule validatie
        # Domein-specifieke checks
        pass
```

## Best Practices

### Configuratie Design

1. **Gebruik beschrijvende sleutelnamen**
   ```yaml
   # Goed
   max_bestand_grootte_mb: 50
   
   # Slecht  
   max_size: 50
   ```

2. **Groep gerelateerde instellingen**
   ```yaml
   # Goed
   api_standaarden:
     max_bestand_grootte_mb: 50
     timeout_seconden: 30
   
   # Slecht
   max_file_size_mb: 50
   api_timeout_seconds: 30
   ```

3. **Gebruik consistente naamgeving**
   ```yaml
   # Consistent: alles snake_case
   afval_typen:
   opruim_dienst_typen:
   urgentie_niveaus:
   ```

### Gebruik in Code

1. **Gebruik de configuratie service**
   ```python
   # Goed
   config = get_configuration_service()
   types = config.get_waste_type_names()
   
   # Slecht
   types = ["plastic", "glas", "papier"]  # Duplicatie!
   ```

2. **Gebruik caching waar mogelijk**
   ```python
   # Configuratie wordt automatisch gecached
   # Geen extra caching logica nodig
   ```

3. **Gebruik validatie voor kritieke operaties**
   ```python
   # Validatie is standaard ingeschakeld
   config = ConfigurationFactory.create_file_based(use_validation=True)
   ```

## Testbaarheid

### Mock Configuratie

Voor testen kan eenvoudig mock configuratie worden gebruikt:

```python
# In tests
from afval_alert.config.loader import ConfigurationFactory

def test_with_mock_config():
    # Gebruik bestaande mock configuratie
    config = ConfigurationFactory.create_file_based(use_validation=False)
    
    # Of maak custom test configuratie
    mock_data = {"afval_typen": {"test_type": "test_type"}}
    # Test logica hier
```

### Test Configuratie Bestanden

Specifieke configuratie voor tests:

```yaml
# tests/config/test_constants.yaml
afval_typen:
  test_plastic: "test_plastic"
  test_glas: "test_glas"
```

## Performance

### Caching Voordelen

- **Snellere toegang**: Configuratie wordt gecached in geheugen
- **Minder I/O**: Bestanden worden slechts één keer gelezen
- **Automatische invalidering**: TTL zorgt voor actuele data

### Lazy Loading

Configuratie wordt pas geladen wanneer nodig:

```python
# Geen configuratie geladen bij initialisatie
config = ConfigurationFactory.create_file_based()

# Configuratie wordt geladen bij eerste gebruik
types = config.get_waste_type_names()  # Nu wordt geladen
```

## Toekomstige Extensies

### Database Integratie

Klaar voor database integratie:

```python
# Huidige implementatie
config = ConfigurationFactory.create_file_based()

# Toekomstige implementatie  
config = ConfigurationFactory.create_database_based("postgresql://...")
```

### Cloud Configuratie

Ondersteuning voor cloud configuratie services:

```python
# Toekomstige implementatie
config = ConfigurationFactory.create_cloud_based("aws_parameter_store")
```

### Realtime Updates

Ondersteuning voor realtime configuratie updates:

```python
# Toekomstige implementatie
config.watch_config("waste_categories", callback=update_handler)
```

Dit configuratie systeem maakt AfvalAlert volledig configuratie-gedreven, onderhoudbaar en klaar voor toekomstige uitbreidingen.