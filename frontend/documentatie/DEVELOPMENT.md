# 🚀 Development Guide - Afval Alert

## 🏗️ Project Setup

### Prerequisites
- Node.js 18+ 
- npm 9+
- VS Code (aanbevolen)
- REST Client extensie voor VS Code (voor HTTP testing)

### Quick Start
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start Storybook (met echte OpenStreetMap API)
npm run storybook

# Run tests
npm run test:e2e
```

## 🧪 Testing & Development

### Test Image Usage
De applicatie gebruikt een test afbeelding van zwerfafval:
- **Locatie**: `src/assets/test-images/zwerfafval-example.jpg`
- **Gebruikt voor**: Mock foto service, Storybook demos, Playwright tests
- **Toont**: Typisch zwerfafval scenario bij prullenbak

### Service Configuration

#### Development (Mock Services):
```typescript
// environment.ts
export const environment = {
  production: false,
  useRealGeocodingApi: false // Mock services
};
```

#### Production (Real APIs):
```typescript  
// environment.prod.ts
export const environment = {
  production: true,
  useRealGeocodingApi: true // OpenStreetMap API
};
```

#### Storybook (Real APIs):
```typescript
// Automatisch via .storybook/preview.ts
window.storybookEnvironment = {
  useRealGeocodingApi: true
};
```

## 📸 Foto Service

### Mock Service (Development)
```typescript
// Gebruikt test afbeelding voor camera/galerij
const fotoService = inject(FotoMockService);
const blob = await fotoService.maakFoto(); // Returns test image
```

### Real Service (Production)
```typescript
// Echte camera/file picker
const fotoService = inject(FotoService);
const blob = await fotoService.maakFoto(); // Camera access
```

## 🗺️ Locatie Services

### Mock Service
- Simuleert GPS locaties binnen Groningen
- Gebruikt statische test data
- Snelle response voor development

### OpenStreetMap Service  
- Echte Nominatim API calls
- Provincie/gemeente/stad/wijk detectie
- Rate limiting: 1 request/seconde

### Test Locaties:
```typescript
// Groningen centrum
{ lat: 53.2194, lng: 6.5665 } // ✅ Geldig

// Groningen noord  
{ lat: 53.2300, lng: 6.5500 } // ✅ Geldig

// Amsterdam
{ lat: 52.3676, lng: 4.9041 } // ❌ Buiten provincie
```

## 🎭 Storybook Development

### Stories Available:
1. **Foto Stap** - Mock foto service met test afbeelding
2. **Locatie Stap** - Echte OpenStreetMap API
3. **API Demo** - Interactieve API testing
4. **Contact Stap** - Form validatie

### Run Storybook:
```bash
npm run storybook
# Open: http://localhost:6006
```

### Test Real APIs in Storybook:
- Ga naar "API Demo/OpenStreetMap Locatie Analyse"
- Test bekende Groningen adressen
- Bekijk console voor API responses

## 🌐 API Testing

### HTTP File Usage:
1. Open `api-tests.http` in VS Code
2. Install REST Client extensie
3. Klik "Send Request" boven elke test

### Test Categories:
- **OpenStreetMap API**: Geocoding tests
- **Development Servers**: Angular/Storybook health checks  
- **Future Backend**: Voorbereid voor backend API
- **Error Scenarios**: Rate limiting, invalid data

### Example Tests:
```http
# Test Groningen locatie
GET https://nominatim.openstreetmap.org/reverse?lat=53.2194&lon=6.5665&format=json
User-Agent: afval-alert-groningen/1.0

# Test adres zoeken
GET https://nominatim.openstreetmap.org/search?q=Grote%20Markt,%20Groningen&format=json
User-Agent: afval-alert-groningen/1.0
```

## 🧪 E2E Testing

### Test Suites:
```bash
# Alle tests
npm run test:e2e

# Specifieke test suite
npx playwright test e2e/afval-melden-complete-flow.spec.ts
npx playwright test e2e/locatie-analyse.spec.ts
npx playwright test e2e/afval-melding-kwaliteit.spec.ts

# Test runner script
./e2e/run-all-tests.ps1
```

### Test Coverage:
- ✅ Complete user journey (6 stappen)
- ✅ Responsive design (mobiel/tablet/desktop)
- ✅ Locatie analyse (OpenStreetMap)
- ✅ Error handling & offline
- ✅ Keyboard accessibility
- ✅ Cross-browser compatibility

## 🔧 Development Scripts

```bash
# Development
npm run dev              # Start Angular dev server
npm run storybook        # Storybook met echte API
npm run build           # Production build

# Testing  
npm run test            # Unit tests (Jest)
npm run test:e2e        # E2E tests (Playwright)
npm run test:e2e:ui     # E2E tests met UI
npm run test:storybook  # Storybook component tests

# Code Quality
npm run lint            # ESLint (indien geconfigureerd)
npm run format          # Prettier (indien geconfigureerd)
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   └── app-users/
│   │       └── features/
│   │           └── afval-melden/
│   │               ├── components/
│   │               │   ├── foto-stap/
│   │               │   ├── locatie-stap/
│   │               │   └── contact-stap/
│   │               ├── services/
│   │               │   ├── foto.service.ts (echte camera)
│   │               │   ├── foto-mock.service.ts (test image)
│   │               │   ├── geocoding-openstreetmap.service.ts
│   │               │   └── geocoding-mock.service.ts
│   │               └── interfaces/
│   ├── assets/
│   │   └── test-images/
│   │       └── zwerfafval-example.jpg
│   └── environments/
├── e2e/
│   ├── afval-melden-complete-flow.spec.ts
│   ├── locatie-analyse.spec.ts
│   └── run-all-tests.ps1
├── .storybook/
├── api-tests.http
├── OPENSTREETMAP.md
└── DEVELOPMENT.md (dit bestand)
```

## 🛠️ Debugging

### Console Logs:
- **Foto Service**: `📸 Mock: Camera foto maken...`
- **Locatie Service**: `🎯 Coördinaten gevonden:`
- **API Calls**: `📊 Locatie analyse:`
- **Errors**: `❌ API fout:`

### Browser DevTools:
- Network tab: Monitor OpenStreetMap API calls
- Console: Service logging en errors
- Application: Local storage voor state

### Storybook Debugging:
- Actions panel: Component events
- Controls panel: Props testing
- Docs panel: Component documentation

## 🔐 Environment Configuration

### Development (default):
- Mock services actief
- Test afbeelding gebruiken  
- Snelle development cycle
- Geen rate limiting

### Storybook:
- Echte OpenStreetMap API
- Test afbeelding voor foto
- Interactieve API testing
- Console debugging

### Production:
- Echte camera/GPS/API
- Rate limiting respect
- Error tracking
- Performance monitoring

## 📚 Resources

- [Angular Signals Guide](https://angular.dev/guide/signals)
- [OpenStreetMap Nominatim API](https://nominatim.org/release-docs/latest/api/Overview/)
- [Playwright Testing](https://playwright.dev/docs/intro)
- [Storybook for Angular](https://storybook.js.org/docs/get-started/frameworks/angular)
- [PrimeNG Components](https://primeng.org/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🐛 Common Issues

### OpenStreetMap API:
- **Rate limiting**: Max 1 request/seconde
- **CORS**: Alleen client-side calls
- **User-Agent**: Verplicht header

### Development:
- **Port conflicts**: Check 4200 (Angular), 6006 (Storybook)
- **Test image missing**: Check assets/test-images/ path
- **Mock services**: Verify environment configuration

### E2E Tests:
- **Timeouts**: API calls kunnen traag zijn
- **Viewport**: Mobile tests vereisen juiste viewport
- **Network**: Offline tests vereisen context.setOffline()

## 🚦 Ready for Backend Integration

Wanneer de backend klaar is:

1. **Update API endpoints** in `api-tests.http`
2. **Configure environment** voor backend URL
3. **Implement real melding service** 
4. **Add authentication** indien nodig
5. **Update E2E tests** voor backend integratie

De frontend is volledig voorbereid met:
- ✅ Service interfaces
- ✅ Error handling  
- ✅ State management
- ✅ Type definitions
- ✅ Test coverage