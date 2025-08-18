# Projectstructuur - Afval Alert Frontend

## Hoofdmappen

```
frontend/
├── src/              # Hoofdbroncode (Angular applicatie)
├── tests/           # Alle testbestanden
│   ├── config/      # Test configuratie
│   ├── e2e/         # End-to-end tests
│   └── unit/        # Unit tests
├── config/          # Applicatie configuratie
│   └── playwright/  # Playwright configuratiebestanden
├── documentatie/    # Technische documentatie
├── public/          # Publieke assets
└── environments/   # Omgeving configuraties
```

## Gedetailleerde Structuur

### `/src` - Hoofdbroncode
Bevat de volledige Angular applicatie:
- `/src/app/` - Applicatie logica en componenten
- `/src/assets/` - Statische bestanden en afbeeldingen
- `/src/environments/` - Omgevingsspecifieke configuraties

### `/tests` - Testbestanden
Alle testgerelateerde bestanden zijn georganiseerd in één centrale locatie:
- `/tests/config/` - Configuratiebestanden voor Jest en andere test frameworks
- `/tests/e2e/` - End-to-end tests met Playwright
- `/tests/unit/` - Unit tests die de structuur van `/src` spiegelen

### `/config` - Applicatieconfiguratie
Bevat applicatiebrede configuratiebestanden:
- `/config/playwright/` - Playwright test configuraties

### `/documentatie` - Documentatie
Technische documentatie over het project:
- Ontwikkelhandleidingen
- Configuratie documentatie
- Projectstructuur uitleg
- **Recente upgrades**:
  - `STAP_INDICATOR_UPGRADE.md` - Verbeterde stapindicatie met animaties

### Overige Mappen
- `/public/` - Publiek toegankelijke assets
- `/environments/` - Omgevingsspecifieke configuraties

## Belangrijke Kenmerken

1. **Gecentraliseerde Tests**: Alle testbestanden zijn verzameld in `/tests/` voor betere organisatie
2. **Duidelijke Splitsing**: Scheiding tussen productiecode (`/src/`) en testcode (`/tests/`)
3. **Gespiegelde Structuur**: Unit tests volgen dezelfde structuur als de broncode
4. **Complexe Features**: Kernfunctionaliteit zit in `/src/app/app-users/features/afval-melden/`
5. **Verbeterde UX**: Recente upgrades zoals de stapindicatie verbeteren de gebruikerservaring