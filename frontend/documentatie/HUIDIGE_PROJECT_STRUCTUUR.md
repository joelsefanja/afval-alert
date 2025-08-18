# Huidige Projectstructuur - Afval Alert Frontend

## Overzicht

Deze documentatie beschrijft de huidige mappenstructuur en organisatie van het Afval Alert frontend project.

## Hoofdmappenstructuur

```
frontend/
├── src/                           # Hoofdbroncode van de applicatie
│   ├── app/                       # Angular applicatie code
│   │   ├── admin/                 # Admin functionaliteit
│   │   ├── afvalmelding/         # Afval melding feature
│   │   ├── app-users/            # Gebruikersgerichte features
│   │   │   ├── features/        # Specifieke features
│   │   │   │   └── afval-melden/ # Afval melden feature
│   │   │   │       ├── components/ # UI componenten
│   │   │   │       ├── interfaces/ # TypeScript interfaces
│   │   │   │       ├── services/   # Services
│   │   │   │       ├── test/       # Test helpers
│   │   │   │       └── tokens/     # Dependency injection tokens
│   │   │   └── shared/           # Gedeelde componenten
│   │   ├── config-viewer/        # Configuratie viewer
│   │   ├── models/               # Data modellen
│   │   ├── services/            # Applicatiebrede services
│   │   ├── app.config.ts        # Applicatie configuratie
│   │   ├── app.html             # Hoofd HTML template
│   │   ├── app.routes.ts        # Route definities
│   │   └── app.spec.ts          # Applicatie tests
│   ├── assets/                  # Statische assets
│   │   ├── config/             # Configuratie assets
│   │   ├── leaflet/            # Leaflet map assets
│   │   └── test-images/        # Test afbeeldingen
│   └── environments/           # Omgeving configuraties
├── config/                     # Applicatie configuratiebestanden
│   └── playwright/             # Playwright configuratiebestanden
│       ├── playwright.config.ts          # Hoofd Playwright configuratie
│       ├── playwright-angular.config.ts   # Playwright met Angular server
│       └── playwright-no-server.config.ts # Playwright zonder server
├── documentatie/               # Technische documentatie
├── public/                     # Publieke assets
├── environments/              # Omgevingsspecifieke configuraties
├── tests/                      # Alle testbestanden en testconfiguraties
│   ├── config/                 # Test configuratiebestanden
│   │   ├── jest.config.js      # Jest configuratie
│   │   ├── setup-jest.ts       # Jest setup
│   │   └── tsconfig.spec.json  # TypeScript configuratie voor tests
│   ├── e2e/                    # End-to-end testbestanden
│   └── unit/                   # Unit testbestanden (gespiegeld van src/)
├── .angular/                   # Angular CLI cache
├── .claude/                    # Claude AI configuratie
├── .vscode/                    # VS Code configuratie
├── playwright-report/         # Playwright test rapporten
├── node_modules/              # npm dependencies (git-ignored)
├── .editorconfig              # Editor configuratie
├── .gitignore                 # Git ignore regels
├── .postcssrc.json            # PostCSS configuratie
├── angular.json               # Angular CLI configuratie
├── app.config.ts              # Applicatie configuratie
├── CLAUDE.md                  # Claude AI documentatie
├── DEVELOPMENT.md             # Ontwikkelingsdocumentatie
├── package-lock.json          # npm lock file
├── package.json               # npm package configuratie
├── README.md                  # Hoofd README
├── tsconfig.app.json          # TypeScript configuratie voor app
├── tsconfig.json              # Hoofd TypeScript configuratie
└── tsconfig.spec.json         # TypeScript configuratie voor tests
```

## Belangrijke Bestanden en Mappen

### Root Niveau Bestanden
- `package.json` - npm package configuratie met scripts
- `angular.json` - Angular CLI configuratie
- `README.md` - Hoofdproject documentatie
- `DEVELOPMENT.md` - Uitgebreide ontwikkelingsdocumentatie
- `CLAUDE.md` - Claude AI integratie documentatie

### Config Directory
De `/config` map bevat applicatiebrede configuratiebestanden:
- `/config/playwright/` - Playwright test configuraties:
  - `playwright.config.ts` - Standaard Playwright configuratie
  - `playwright-angular.config.ts` - Configuratie voor tests met Angular development server
  - `playwright-no-server.config.ts` - Configuratie voor tests zonder webserver

### Tests Directory
De `/tests` map bevat alle testgerelateerde bestanden:
- `/tests/config/` - Configuratiebestanden voor test frameworks
- `/tests/e2e/` - End-to-end test suites met Playwright
- `/tests/unit/` - Unit testbestanden die de structuur van `/src/` spiegelen

### Source Code Structuur
De `/src` map bevat de volledige Angular applicatie:
- `/src/app/` - Hoofdapplicatie logica
- `/src/app/app-users/features/afval-melden/` - Kernfeature voor afvalmeldingen
- `/src/assets/` - Statische bestanden inclusief testafbeeldingen
- `/src/environments/` - Omgevingsspecifieke configuraties

### Documentatie
- `/documentatie/` - Technische documentatie inclusief CONFIGURATIE.md en DEVELOPMENT.md
- Inline code comments en JSDoc in de bronbestanden

## Teststructuur

### Unit Tests
Unit tests zijn georganiseerd in `/tests/unit/` en spiegelen de structuur van `/src/`:
- Elke component/service heeft corresponderende `.spec.ts` bestanden
- Test helpers zijn beschikbaar in `/src/app/app-users/features/afval-melden/test/`

### End-to-End Tests
E2E tests gebruiken Playwright en zijn georganiseerd in `/tests/e2e/`:
- Complexe test flows voor het volledige afval meld proces
- Locatie analyse tests met OpenStreetMap integratie
- Component styling en responsiviteit tests

## Build en Deployment

### Configuratiebestanden
- `tsconfig*.json` - TypeScript compilatie configuraties
- `angular.json` - Angular build en serve configuraties
- `/config/playwright/*.config.ts` - Test runner configuraties

### Output Mappen
- `dist/` - Build output (automatisch gegenereerd)
- `playwright-report/` - Test rapportages
- `.angular/` - Angular CLI cache

## Dependencies

### Runtime Dependencies
Gedefinieerd in `package.json` dependencies:
- Angular 20+ framework
- PrimeNG componenten bibliotheek
- Leaflet voor maps
- TailwindCSS voor styling
- RxJS voor reactive programming

### Development Dependencies
Gedefinieerd in `package.json` devDependencies:
- Jest voor unit testing
- Playwright voor end-to-end testing
- Angular CLI tools
- TypeScript compiler