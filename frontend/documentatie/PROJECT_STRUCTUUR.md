# Projectstructuur Herstructurering

## Samenvatting van wijzigingen

Als onderdeel van de inspanningen om de projectstructuur te verbeteren en testbestanden te organiseren, zijn de volgende wijzigingen aangebracht:

1. **Nieuwe testdirectory aangemaakt**
   - Een nieuwe `/tests` directory is aangemaakt in de hoofdmap
   - Alle testgerelateerde bestanden zijn verplaatst naar deze directory

2. **Verplaatste bestanden en mappen**
   - `api-tests.http` → `/tests/`
   - `e2e/` → `/tests/e2e/`
   - Jest configuratiebestanden → `/tests/config/`
   - Unit testbestanden → `/tests/unit/`
   - Playwright configuratiebestanden → `/config/playwright/`

3. **Bijgewerkte configuratiebestanden**
   - `jest.config.js` is bijgewerkt om de nieuwe paden te reflecteren
   - Testpaden zijn aangepast aan de nieuwe structuur
   - Playwright configuratiebestanden zijn verplaatst naar `/config/playwright/`

4. **Nieuwe documentatie**
   - `README.md` bestanden zijn aangemaakt om de nieuwe structuur uit te leggen
   - Projectdocumentatie is bijgewerkt

## Redenen voor herstructurering

1. **Verbeterde organisatie**: Door alle testbestanden in één directory te plaatsen, wordt de projectstructuur overzichtelijker.
2. **Duidelijke scheiding**: Er is nu een duidelijke scheiding tussen productiecode en testcode.
3. **Makkelijker onderhoud**: Het is eenvoudiger om testbestanden te vinden en te beheren.
4. **Schaalbaarheid**: De nieuwe structuur ondersteunt beter groei en uitbreiding van het project.

## Nieuwe projectstructuur

```
/
├── frontend/
│   ├── src/                    # Hoofdbroncode
│   ├── config/                 # Configuratiebestanden
│   │   └── playwright/         # Playwright configuratiebestanden
│   ├── documentatie/           # Technische documentatie
│   ├── public/                 # Statische assets
│   ├── environments/          # Omgevingsspecifieke configuraties
│   ├── tests/                  # Alle testbestanden en testconfiguraties
│   │   ├── config/             # Test configuratiebestanden
│   │   ├── e2e/                # End-to-end testbestanden
│   │   └── unit/               # Unit testbestanden (gespiegeld van src/)
│   └── README.md              # Frontend documentatie
├── README.md                  # Hoofdproject documentatie
└── [andere mappen zoals backend/ indien aanwezig]
```

## Impact op ontwikkeling

1. **Testuitvoering**: De commando's voor het uitvoeren van tests blijven hetzelfde
2. **Import paden**: De import paden in de testbestanden zijn automatisch aangepast
3. **IDE configuratie**: Mogelijk moet de IDE configuratie worden bijgewerkt om de nieuwe paden te herkennen

## Volgende stappen

1. Controleer of alle tests nog correct werken
2. Werk de documentatie bij met de nieuwe structuur
3. Update eventuele CI/CD configuraties die verwijzen naar testbestanden