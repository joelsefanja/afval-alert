# Services Documentatie - Afval Melden App

## Overzicht

Deze documentatie beschrijft alle services die gebruikt worden in de Afval Melden applicatie. Alle services zijn ontworpen volgens de volgende principes:

- **Maximaal 50 regels** per service
- **Maximaal 4 methoden** per service  
- **Single Responsibility Principle**
- **Signals-based state management**
- **Comprehensive documentation**

## Service Architectuur

```
StepBuilderService (Core)
├── FotoStapService
├── LocatieStapService  
├── ContactStapService
├── ControleStapService
└── SuccesStapService
```

## Core Services

### StepBuilderService
**Bestand:** `services/step-builder.service.ts`

**Doel:** Centraal beheer van de multi-step flow met builder pattern

**Methoden:**
- `addStep(config)` - Voeg stap toe aan flow
- `next()` - Ga naar volgende stap
- `prev()` - Ga naar vorige stap  
- `goto(index)` - Spring naar specifieke stap
- `reset()` - Reset naar eerste stap

**Signals:**
- `activeIndex` - Huidige stap index
- `menuItems` - PrimeNG Steps menu items
- `currentStep` - Huidige stap configuratie

**Voorbeeld:**
```typescript
// Configureer stappen met chaining
this.stepBuilder
  .addStep({ label: 'Start', component: StartStapComponent, icon: 'pi pi-play' })
  .addStep({ label: 'Foto', component: FotoStapComponent, icon: 'pi pi-camera' });

// Navigatie
this.stepBuilder.next(); // Volgende stap
this.stepBuilder.prev(); // Vorige stap
this.stepBuilder.goto(2); // Spring naar stap 2
```

---

## Step Services

### FotoStapService
**Bestand:** `services/foto-stap.service.ts`

**Doel:** Camera beheer en foto functionaliteit

**Methoden:**
- `startCamera()` - Start camera stream
- `takeFoto(video)` - Maak foto van video element
- `selectFromGallery()` - Selecteer foto uit galerij
- `stopCamera()` - Stop camera en cleanup

**Signals:**
- `cameraActive` - Camera status
- `fotoUrl` - URL van gemaakte foto

**Voorbeeld:**
```typescript
// Start camera
const stream = await this.fotoService.startCamera();

// Maak foto
this.fotoService.takeFoto(videoElement);

// Check status
if (this.fotoService.fotoUrl()) {
  console.log('Foto gemaakt!');
}
```

### LocatieStapService  
**Bestand:** `services/locatie-stap.service.ts`

**Doel:** Locatie bepaling en adres beheer

**Methoden:**
- `getCurrentLocation()` - Verkrijg GPS locatie
- `searchAddress(query)` - Zoek adressen
- `selectLocation(location)` - Selecteer locatie
- `next()` - Ga naar volgende stap

**Signals:**
- `loading` - Laden status
- `location` - Geselecteerde locatie
- `searchResults` - Zoekresultaten

**Interfaces:**
```typescript
interface LocatieData {
  address: string;
  lat: number;
  lng: number;
}
```

**Voorbeeld:**
```typescript
// Haal huidige locatie op
await this.locatieService.getCurrentLocation();

// Zoek adressen
await this.locatieService.searchAddress('Groningen');

// Selecteer uit zoekresultaten
this.locatieService.selectLocation(searchResult);
```

### ContactStapService
**Bestand:** `services/contact-stap.service.ts`

**Doel:** Contactgegevens validatie en beheer

**Methoden:**
- `setNaam(naam)` - Zet naam
- `setEmail(email)` - Zet email met validatie
- `setAnoniem(anoniem)` - Zet anonieme modus
- `saveAndNext()` - Valideer en sla op

**Signals:**
- `naam` - Naam waarde
- `email` - Email waarde
- `anoniem` - Anonieme melding
- `isFormValid` - Form validatie status
- `isEmailValid` - Email validatie status

**Interfaces:**
```typescript
interface ContactData {
  naam?: string;
  email?: string;
  anoniem: boolean;
}
```

**Voorbeeld:**
```typescript
// Zet contactgegevens
this.contactService.setNaam('John Doe');
this.contactService.setEmail('john@example.com');

// Check validatie
if (this.contactService.isFormValid()) {
  this.contactService.saveAndNext();
}
```

### ControleStapService
**Bestand:** `services/controle-stap.service.ts`

**Doel:** Melding overzicht en verzending

**Methoden:**
- `submit()` - Verstuur melding
- `editFoto()` - Ga naar foto stap
- `editLocatie()` - Ga naar locatie stap
- `editContact()` - Ga naar contact stap

**Signals:**
- `overzicht` - Complete melding data
- `isComplete` - Melding compleet status

**Interfaces:**
```typescript
interface MeldingOverzicht {
  fotoUrl?: string;
  locatie?: string;
  contactNaam?: string;
  contactEmail?: string;
  isAnoniem: boolean;
}
```

**Voorbeeld:**
```typescript
// Check completeness
if (this.controleService.isComplete()) {
  this.controleService.submit();
}

// Edit functionaliteit
this.controleService.editFoto(); // Ga naar foto stap
```

### SuccesStapService
**Bestand:** `services/succes-stap.service.ts`

**Doel:** Afronding en reset functionaliteit

**Methoden:**
- `resetAndStart()` - Reset alles en start nieuwe melding
- `closeApp()` - Sluit applicatie

**Voorbeeld:**
```typescript
// Start nieuwe melding
this.succesService.resetAndStart();

// Sluit app
this.succesService.closeApp();
```

---

## Utility Services

### CameraService
**Bestand:** `services/camera.service.ts`

**Doel:** Low-level camera API wrapper

**Methoden:**
- `getUserMedia()` - Verkrijg camera stream
- `captureFrame(video)` - Maak screenshot van video
- `stopTracks(stream)` - Stop media tracks
- `selectFromDevice()` - File picker voor galerij

### LocationService  
**Bestand:** `services/location.service.ts`

**Doel:** Geolocation en geocoding API wrapper

**Methoden:**
- `getCurrentPosition()` - GPS coordinaten
- `reverseGeocode(lat, lng)` - Coordinaten naar adres
- `searchAddress(query)` - Adres zoeken

### MeldingStateService
**Bestand:** `services/melding-state.service.ts`

**Doel:** Centrale state management voor melding data

**Methoden:**
- `setFoto(url)` - Sla foto URL op
- `setLocatie(address, lat, lng)` - Sla locatie op
- `setContact(naam, email, anoniem)` - Sla contactgegevens op
- `reset()` - Reset alle data

**Interfaces:**
```typescript
interface MeldingData {
  foto?: string;
  locatie?: { address: string; lat: number; lng: number };
  contact?: { naam?: string; email?: string; anoniem?: boolean };
}
```

---

## Design Patterns

### 1. Builder Pattern
Services gebruiken chaining voor configuratie:
```typescript
this.stepBuilder
  .addStep({...})
  .addStep({...})
  .addStep({...});
```

### 2. Facade Pattern
Step services fungeren als facade voor complexe operaties:
```typescript
// Complex camera setup wordt versimpeld tot:
await this.fotoService.startCamera();
```

### 3. Signal-based State
Alle state is reactive via signals:
```typescript
readonly isFormValid = computed(() => {
  return this.anoniem() || this.validateEmail(this.email());
});
```

### 4. Dependency Injection
Services injecteren afhankelijkheden:
```typescript
private locationService = inject(LocationService);
private stepBuilder = inject(StepBuilderService);
```

---

## Testing Guidelines

### Unit Tests
Elke service heeft een `.spec.ts` bestand met:
- Methode tests
- Signal behavior tests  
- Error handling tests
- Integration tests

### Service Mocking
```typescript
const mockStepBuilder = {
  next: jasmine.createSpy('next'),
  prev: jasmine.createSpy('prev')
};
```

---

## Best Practices

### 1. Service Grootte
- **Max 50 regels** per service
- **Max 4 publieke methoden**
- **Single responsibility**

### 2. Error Handling
```typescript
try {
  await this.locationService.getCurrentPosition();
} catch (error) {
  console.error('Location error:', error);
  // Handle gracefully
}
```

### 3. Signal Updates
```typescript
// Atomic updates
this.loading.set(true);
try {
  const result = await this.apiCall();
  this.data.set(result);
} finally {
  this.loading.set(false);
}
```

### 4. Memory Management
```typescript
ngOnDestroy() {
  this.fotoService.stopCamera(); // Cleanup resources
}
```

---

## Performance Tips

1. **Lazy Loading:** Services zijn tree-shakable
2. **Signal Optimization:** Computed signals cachen automatisch
3. **Memory Leaks:** Cleanup in ngOnDestroy
4. **Bundle Size:** Kleine services = betere code splitting

---

## Migration Guide

### Van oude naar nieuwe services:

**Voor:**
```typescript
// Component met veel logica
export class OldComponent {
  async getCurrentLocation() {
    // 20+ regels camera logica
  }
  
  validateForm() {
    // 15+ regels validatie logica  
  }
}
```

**Na:**
```typescript
// Component alleen presentatie
export class NewComponent {
  private service = inject(LocatieStapService);
  
  async getCurrentLocation() {
    await this.service.getCurrentLocation();
  }
}
```

Dit resulteert in:
- ✅ **Testbare code** (services kunnen gemockt worden)
- ✅ **Herbruikbare logica** (services zijn injectable)
- ✅ **Kleinere componenten** (max 20 regels TypeScript)
- ✅ **Betere separation of concerns**