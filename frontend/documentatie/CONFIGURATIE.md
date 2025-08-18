# Configuratie Systeem

## Overzicht

Het configuratiesysteem maakt het mogelijk om de applicatie te configureren voor verschillende gemeentes of provincies. De configuratie wordt gedefinieerd in een eenvoudig JSON-bestand.

## Configuratiebestand

Het configuratiebestand bevindt zich in: `config/locatie-config.json`

### Structuur

```json
{
  "versie": "1.0",
  "toegestaneGebieden": [
    {
      "naam": "Groningen",
      "type": "gemeente",
      "land": "Nederland"
    }
  ],
  "nominatim": {
    "baseUrl": "https://nominatim.openstreetmap.org",
    "reverseZoom": 18,
    "searchZoom": 18,
    "addressdetails": 1,
    "format": "json"
  }
}
```

### Toegestane Gebieden

De `toegestaneGebieden` sectie definieert welke gemeentes of provincies gebruik mogen maken van de applicatie:

- `naam`: De naam van de gemeente of provincie
- `type`: Het type gebied (`gemeente` of `provincie`)
- `land`: Het land waarin het gebied zich bevindt

### Nominatim Configuratie

De `nominatim` sectie bevat instellingen voor de OpenStreetMap Nominatim API:

- `baseUrl`: De basis-URL voor de Nominatim API
- `reverseZoom`: Zoomniveau voor reverse geocoding
- `searchZoom`: Zoomniveau voor adres zoeken
- `addressdetails`: Of adresdetails moeten worden geretourneerd (1 = ja, 0 = nee)
- `format`: Het gewenste responsformaat (json, xml, etc.)

## Uitbreiden naar Meerdere Gemeentes

Om de applicatie uit te breiden naar meerdere gemeentes:

1. **Voeg gemeentes toe aan de configuratie:**

```json
{
  "versie": "1.0",
  "toegestaneGebieden": [
    {
      "naam": "Groningen",
      "type": "gemeente",
      "land": "Nederland"
    },
    {
      "naam": "Amsterdam",
      "type": "gemeente",
      "land": "Nederland"
    },
    {
      "naam": "Utrecht",
      "type": "provincie",
      "land": "Nederland"
    }
  ],
  "nominatim": {
    "baseUrl": "https://nominatim.openstreetmap.org",
    "reverseZoom": 18,
    "searchZoom": 18,
    "addressdetails": 1,
    "format": "json"
  }
}
```

2. **De applicatie valideert automatisch of adressen binnen de toegestane gebieden liggen.**

## Voorbeeldconfiguratie

Een voorbeeldconfiguratie met meerdere gemeentes is beschikbaar in: `config/voorbeeld-config.json`

## Best Practices

1. **Houd de configuratie eenvoudig** - alleen de benodigde velden
2. **Gebruik consistente naamgeving** voor gemeentes en provincies
3. **Vermijd speciale karakters** in namen
4. **Controleer spelling** van gemeentenamen
5. **Gebruik altijd volledige namen** (bijv. "Groningen" in plaats van "Gronn")