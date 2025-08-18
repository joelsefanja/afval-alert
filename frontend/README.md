# Afval Alert Frontend

Welkom bij de frontend van de Afval Alert applicatie. 
Deze Angular-applicatie stelt burgers in staat om zwerfafval gemakkelijk te melden via hun mobiele telefoon.

## Projectstructuur

- `/src` - Hoofdbroncode van de applicatie
- `/config` - Configuratiebestanden voor de applicatie
- `/documentatie` - Technische documentatie
- `/public` - Statische assets
- `/tests` - Alle testbestanden en testconfiguraties:
  - `/config` - Jest en andere testconfiguratiebestanden
  - `/e2e` - End-to-end testbestanden
  - `/unit` - Unit testbestanden (gespiegeld van `/src`)
- `/environments` - Omgevingsspecifieke configuraties

## Ontwikkelinstallatie

1. Installeer Node.js (versie 18+)
2. Installeer de afhankelijkheden: `npm install`
3. Start de ontwikkelserver: `npm start`

## Ontwikkeling

Voor gedetailleerde informatie over het opzetten van de ontwikkelomgeving, testen en debugging, zie [DEVELOPMENT.md](documentatie/DEVELOPMENT.md).

## Testen

### Unit Tests
```bash
npm run test
```

### End-to-end Tests
```bash
npm run test:e2e
```

## Productiebuild
```bash
npm run build
```

## Configuratie

De applicatie kan worden geconfigureerd voor verschillende gemeentes via het configuratiesysteem. Zie `/documentatie/CONFIGURATIE.md` voor meer details.