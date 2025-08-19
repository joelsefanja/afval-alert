# 🤖 Gemini 2.0 Flash Zwerfafval Herkenning

Dit project gebruikt **Google Gemini 2.0 Flash** voor intelligente zwerfafval herkenning in Nederlandse gemeenten.

## 🚀 Setup

### 1. Google AI Studio API Key

1. Ga naar [Google AI Studio](https://aistudio.google.com/)
2. Maak een nieuwe API key aan
3. Voeg de key toe aan je environment:

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  GEMINI_API_KEY: 'jouw-echte-api-key-hier'
};
```

### 2. Features

#### ✅ Directe Afbeelding Analyse
- **Model**: `gemini-2.0-flash-exp`
- **Input**: Foto blob van zwerfafval
- **Output**: Gedetecteerde afvaltypen met zekerheidsscores

#### ✅ Nederlandse Gemeente Prompts
- Gespecialiseerd voor Nederlandse context
- Ondersteunt 16 afvalcategorieën
- Vriendelijke bedankboodschappen

#### ✅ Robuuste Error Handling
- Automatische fallbacks
- Validatie van API responses
- Lokale backup classificatie

#### ✅ Productie-Klaar
- Configureerbare temperatuur settings
- Rate limiting ready
- Comprehensive logging

## 🧠 Ondersteunde Afvaltypen

```typescript
const afvalTypes = [
  'plastic_flessen', 'plastic_zakken', 'blikjes', 'glas',
  'papier', 'karton', 'sigarettenpeuken', 'voedselresten',
  'hondenpoop', 'elektronisch_afval', 'textiel', 'metaal',
  'batterijen', 'chemisch_afval', 'gemengd_afval', 'niet_classificeerbaar'
];
```

## 📊 Response Format

```json
{
  "is_afval": true,
  "afval_types": [
    {
      "afval_type": "plastic_flessen",
      "zekerheid": 0.85
    }
  ],
  "kenmerken": ["transparant", "plastic", "fles vorm"],
  "bedank_boodschap": "Bedankt voor je melding van plastic afval!"
}
```

## 🔧 Usage

```typescript
// Direct gebruik
const result = await geminiService.classifyAfval(photoBlob);

// Via foto-verwerking service
const processed = await fotoVerwerkingService.verwerkFoto(photoBlob);
```

## 🛡️ Security & Privacy

- ✅ Geen data opslag op Google servers na verwerking
- ✅ Lokale fallback bij API failures
- ✅ GDPR-compliant verwerking
- ✅ Rate limiting en quota management

## 🚦 Status Monitoring

De service logt uitgebreid voor monitoring:

```
🔍 Starting Gemini 2.0 Flash afval analysis...
📤 Sending request to Gemini 2.0 Flash...
📥 Received response from Gemini: {...}
✅ Gemini analyse voltooid
```

## 💡 Tips

1. **Beste Foto's**: Goed belichte, scherpe foto's geven betere resultaten
2. **API Quota**: Monitor je gebruik in Google AI Studio
3. **Fallbacks**: Service werkt ook zonder API key (lokale classificatie)
4. **Performance**: Gemini 2.0 Flash is geoptimaliseerd voor snelheid

## 🔗 Links

- [Google AI Studio](https://aistudio.google.com/)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Nederlandse Afval Richtlijnen](https://www.rijksoverheid.nl/onderwerpen/afval)