# Claude Code Configuration - Afval Alert Frontend

## 🚨 CRITICAL: CONCURRENT EXECUTION & FILE MANAGEMENT

**ABSOLUTE RULES**:
1. ALL operations MUST be concurrent/parallel in a single message
2. **NEVER save working files, text/mds and tests to the root folder**
3. ALWAYS organize files in appropriate subdirectories

### ⚡ GOLDEN RULE: "1 MESSAGE = ALL RELATED OPERATIONS"

**MANDATORY PATTERNS:**
- **TodoWrite**: ALWAYS batch ALL todos in ONE call (5-10+ todos minimum)
- **Task tool**: ALWAYS spawn ALL agents in ONE message with full instructions
- **File operations**: ALWAYS batch ALL reads/writes/edits in ONE message
- **Bash commands**: ALWAYS batch ALL terminal operations in ONE message

### 📁 File Organization Rules

**NEVER save to root folder. Use these directories:**
- `/src` - Source code files
- `/tests` - Test files
- `/docs` - Documentation and markdown files
- `/documentatie` - Dutch documentation
- `/config` - Configuration files
- `/scripts` - Utility scripts
- `/examples` - Example code

## Project Overview

Dit is een Angular 20 afval-melding applicatie met moderne Angular features en PWA-ondersteuning.

### Technology Stack
- **Angular 20** - Latest Angular framework
- **TypeScript 5.8** - Type-safe development
- **PrimeNG 20** - UI component library
- **PrimeFlex v4** - CSS utility classes for layouts and forms
- **TailwindCSS v4** - Utility-first CSS framework
- **Leaflet** - Interactive maps
- **Jest** - Unit testing
- **Playwright** - E2E testing
- **Google Gemini AI** - Waste classification
- **PWA** - Progressive Web App features

## Angular 20 Modern Practices

### ⚠️ MANDATORY ANGULAR 20 RULES
1. **Control Flow**: Use `@if`, `@for`, `@switch` - NEVER `*ngIf`, `*ngFor`, `*ngSwitch`
2. **Signals**: ALWAYS use signals for reactive state management
3. **Input/Output**: Use `input()`, `output()` functions - NEVER `@Input()`, `@Output()` decorators
4. **Standalone Components**: All components MUST be standalone
5. **inject()**: Use `inject()` function for dependency injection

### Component Structure Template
```typescript
import { Component, input, output } from '@angular/core';
import { signal, computed } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [],
  template: `
    @if (showContent()) {
      <div>
        @for (item of items(); track item.id) {
          <span>{{ item.name }}</span>
        }
      </div>
    }
  `
})
export class ExampleComponent {
  // Input signals
  data = input<string>('');
  items = input.required<Item[]>();
  
  // Output signals
  itemClick = output<Item>();
  
  // State signals
  showContent = signal(true);
  
  // Computed signals
  itemCount = computed(() => this.items().length);
}
```

## Build Commands

```bash
# Development
npm run dev          # Start development server
npm run start        # Alternative start command

# Build
npm run build        # Production build
npm run watch        # Development build with watch

# Testing
npm test             # Run Jest unit tests
npm run test:e2e     # Run Playwright E2E tests
npm run test:e2e:ui  # Run E2E tests with UI
npm run test:e2e:headed # Run E2E tests in headed mode

# Quality
npm run lint         # ESLint code linting
npm run health-check # Application health check
```

## Project Structure

### Core Application Structure
```
src/app/
├── app-users/features/afval-melden/    # Main waste reporting feature
│   ├── components/                     # Step-based components (1-6)
│   ├── services/                       # Business logic services
│   └── interfaces/                     # TypeScript interfaces
├── admin/                             # Admin dashboard
├── models/                            # Shared data models
└── services/                          # Global services
```

### Component Organization (6 Steps)
```
components/
├── 1-introductie/                     # Introduction step
├── 2-foto-upload/                     # Photo capture & AI classification
├── 3-locatie-selectie/               # Location selection step
├── 4-contact-gegevens/               # Contact details step
├── 5-controle/                       # Review step
├── 6-melding-verzonden/              # Success step (shows AI results)
├── afval-melden/                     # Main orchestrator component
└── shared/                           # Shared components
```

**Flow Changes:**
- Removed step 4 (afval-classificatie) - AI classification happens asynchronously
- AI results are shown on final page (step 6) after photo upload
- Streamlined from 7 to 6 steps for better UX

## Service Architecture

### Location Services
- `locatie.service.ts` - Core location orchestrator (103 lines)
- `kaart.service.ts` - Map operations orchestrator (110 lines)
- `kaart/kaart-initialisatie.service.ts` - Map initialization
- `kaart/kaart-marker.service.ts` - Marker management  
- `kaart/kaart-geolocation.service.ts` - Browser geolocation
- `geocoding/geocoding.service.ts` - Address resolution
- `geocoding/adres-formatter.service.ts` - Address formatting
- `validatie/locatie-validatie.service.ts` - Location validation

### Media Services
- `media.service.ts` - Media orchestrator (112 lines)
- `camera.service.ts` - Native camera API wrapper
- `afval-classificatie/` - AI classification services
  - `IAfvalClassificatieService` - Interface voor DI
  - `mock-classificatie.service.ts` - Pure mock (no API)
  - `gemini-classificatie.service.ts` - Gemini SDK direct
  - `production-classificatie.service.ts` - Python microservice
  - `afval-classificatie.token.ts` - DI token
  - `providers.ts` - Service providers (3 implementations)

### State Management  
- `melding/state/` - Report state services
- `proces/navigatie/` - Step navigation services
- `opslag/` - Session storage services

## Afval Classification System

### AI Service Architecture
- **Interface-based DI**: `IAfvalClassificatieService` for swappable implementations
- **Mock**: `MockClassificatieService` - Pure mock data (no API calls)
- **Development**: `GeminiClassificatieService` - Direct Gemini SDK integration
- **Production**: `ProductionClassificatieService` - Python microservice endpoint
- **DI Token**: `AFVAL_CLASSIFICATIE_SERVICE` for dependency injection

### Supported Categories (11 total)
```typescript
"Grofvuil", "Restafval", "Glas", "Papier en karton",
"Organisch", "Textiel", "Elektronisch afval", 
"Bouw- en sloopafval", "Chemisch afval", "Overig", "Geen afval"
```

### Response Format
```typescript
interface AfvalClassificatieResponse {
  afval_typen: Array<{
    afval_type: string;      // Exact category name
    confidence: number;      // 0.0 - 1.0, only > 0.0 returned
  }>;
}
```

### Implementation Switching
```typescript
// Mock - No API calls (testing)
providers: [AFVAL_CLASSIFICATIE_PROVIDERS.mock]

// Development - Direct Gemini SDK
providers: [AFVAL_CLASSIFICATIE_PROVIDERS.development]

// Production - Python microservice
providers: [AFVAL_CLASSIFICATIE_PROVIDERS.production]
```

### Service Implementations
- **Mock**: Local mock data, ~1.2s delay simulation
- **Gemini SDK**: `@google/generative-ai` package, direct API calls
- **Microservice**: HTTP FormData upload to Python service (30s timeout)

## Code Style & Best Practices

### Angular 20 Component Guidelines
```typescript
// ✅ CORRECT - Angular 20 style
@Component({
  standalone: true,
  template: `
    @if (isLoading()) {
      <div>Loading...</div>
    } @else {
      @for (item of items(); track item.id) {
        <div (click)="onItemClick.emit(item)">
          {{ item.name }}
        </div>
      }
    }
  `
})
export class ModernComponent {
  items = input.required<Item[]>();
  onItemClick = output<Item>();
  isLoading = signal(false);
}

// ❌ WRONG - Old Angular style
@Component({
  template: `
    <div *ngIf="isLoading">Loading...</div>
    <div *ngFor="let item of items" (click)="onItemClick.emit(item)">
      {{ item.name }}
    </div>
  `
})
export class OldComponent {
  @Input() items!: Item[];
  @Output() onItemClick = new EventEmitter<Item>();
}
```

### Service Pattern
```typescript
// Use inject() function with DI tokens
@Injectable({ providedIn: 'root' })
export class ModernService {
  private http = inject(HttpClient);
  private ai = inject(AFVAL_CLASSIFICATIE_SERVICE);
  
  // Use signals for reactive state
  readonly state = signal<AppState>(initialState);
  readonly computed = computed(() => this.state().processed);
}
```

### Service Organization Rules
- **Orchestrator Pattern**: Main services delegate to specialized sub-services
- **Max 100-110 lines**: Keep services focused and readable  
- **Dutch naming**: Service methods use Dutch names (e.g., `maakFoto()`, `classificeerAfval()`)
- **Sub-service structure**: Organize related functionality in subdirectories
- **No empty index.ts**: Only create index files when multiple exports needed

## Refactored Service Architecture (2024)

### 🏗️ New Clean Service Structure

De service architectuur is volledig gerefactord volgens SOLID principes:

#### NavigatieService
```typescript
// Clean Nederlandse interface voor stap navigatie
volgende(): boolean     // Ga naar volgende stap
vorige(): boolean      // Ga naar vorige stap  
gaNaarStap(index: number): boolean
herstart(): void
krijgStapNaam(): string
```

#### Media Services (SOC Pattern)
```
media/
├── foto/
│   └── foto.service.ts           # Alleen foto state management
├── camera/
│   ├── camera-toegang.service.ts  # Camera toegang & permissions
│   └── foto-vastleggen.service.ts # Foto maken operaties
├── ai/
│   └── afval-herkenning.service.ts # AI classificatie
└── media-orchestrator.service.ts   # Coördineert alle media operaties
```

#### Melding Services (Focused)
```
melding/
├── concept/
│   └── melding-concept.service.ts     # Concept state management
├── validatie/
│   └── melding-validatie.service.ts   # Centralized validation
├── verzending/
│   └── melding-verzending.service.ts  # Verzending operaties
└── state/
    └── afval-melding-state.service.ts # Legacy compatibility
```

#### Step Services (Per-Stap Logic)
```
stappen/
├── intro/
│   └── intro-stap.service.ts    # Intro stap logica
├── foto/
│   └── foto-stap.service.ts     # Foto stap orchestration
└── contact/
    └── contact-stap.service.ts  # Contact stap validatie
```

### 🔄 Service Interaction Pattern

```typescript
// Components gebruik orchestrator services
@Component({})
export class FotoComponent {
  private fotoStap = inject(FotoStapService);     // Step logic
  private navigator = inject(NavigatieService);   // Navigation
  
  async maakFoto() {
    await this.fotoStap.maakFoto(this.videoElement);
    this.navigator.volgende();
  }
}

// Orchestrator delegeert naar focused services
@Injectable()
export class MediaOrchestratorService {
  private foto = inject(FotoService);             // State
  private camera = inject(CameraToegangService);  // Camera
  private capture = inject(FotoVastleggenService); // Capture
  private ai = inject(AfvalHerkenningService);    // AI
}
```

### 🎯 Service Principles

1. **Single Responsibility**: Elke service heeft één duidelijke taak
2. **Nederlandse API**: Alle publieke methoden in het Nederlands
3. **Signal-based**: Angular 20 signals voor reactive state
4. **Orchestrator Pattern**: Complexe operaties via orchestrator services
5. **Clean Interfaces**: Minimale surface area, maximale usability
6. **Dependency Injection**: Proper DI met interfaces voor testability

### CSS Organization Rules
- **Layer Priority**: reset → primeflex → tailwind → primeng → components
- **PrimeFlex for Structure**: Use for grids, forms, and component layouts
- **Tailwind for Polish**: Use for colors, effects, and custom styling
- **Mobile-First Always**: Start with smallest screen, enhance upward
- **Component-Scoped**: Prefer utility classes over custom CSS

### Testing Strategy
- **Unit Tests**: Jest with component testing
- **E2E Tests**: Playwright for user journeys
- **Integration Tests**: Component interaction testing

## PWA Features

- Service Worker for offline functionality
- App manifest for installability
- Push notifications for status updates
- Background sync for report submission

## Environment Configuration

### Development
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  geminiApiKey: 'your-dev-key'
};
```

### Production
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.afval-alert.nl',
  geminiApiKey: 'your-prod-key'
};
```

## Performance Optimization

- **Lazy Loading**: Feature modules loaded on demand
- **OnPush Strategy**: Change detection optimization  
- **TrackBy Functions**: Efficient list rendering
- **Signal-based**: Reactive updates without zone.js overhead
- **Computed signals**: Efficient derived state calculations
- **Service delegation**: Small focused services under 100-110 lines
- **Camera optimization**: Proper MediaStream management and cleanup

## Security Best Practices

- **No hardcoded secrets**: Use environment variables
- **Sanitized inputs**: XSS prevention
- **HTTPS only**: Secure communications
- **CSP headers**: Content Security Policy

## Quality Assurance

### Pre-commit Requirements
1. All tests must pass (`npm test`)
2. Lint checks must pass (`npm run lint`)
3. Build must succeed (`npm run build`)
4. E2E tests for critical paths must pass

### Code Review Checklist
- [ ] Uses Angular 20 control flow (`@if`, `@for`)
- [ ] Uses signals for state management
- [ ] Uses `input()`/`output()` instead of decorators
- [ ] Components are standalone
- [ ] Services under 100-110 lines with orchestrator pattern
- [ ] Dutch naming for service methods
- [ ] DI interfaces for swappable services
- [ ] No hardcoded configuration
- [ ] Proper error handling
- [ ] Camera MediaStream cleanup
- [ ] Unit tests included
- [ ] TypeScript types defined

## Deployment

### Build for Production
```bash
npm run build
# Outputs to dist/ directory
```

### Health Check
```bash
npm run health-check
# Verifies application health
```

## Troubleshooting

### Common Issues
1. **Control Flow Migration**: Replace `*ngIf`/`*ngFor` with `@if`/`@for`
2. **Signal Updates**: Use `.set()` and `.update()` methods
3. **Import Errors**: Ensure standalone components import dependencies
4. **Map Issues**: Check Leaflet asset paths

### Debug Commands
```bash
# Detailed build analysis
ng build --stats-json

# E2E test debugging
npm run test:e2e:headed

# Development with source maps
ng serve --source-map
```

## Support & Documentation

- **Project Docs**: `/docs` and `/documentatie` directories
- **API Documentation**: `SERVICES_DOCUMENTATION.md`
- **PWA Setup**: `PWA_SETUP.md`
- **Development Guide**: `documentatie/DEVELOPMENT.md`

---

## PrimeFlex v4 + Tailwind CSS v4 Integration

### Overview
This project uses PrimeFlex v4 alongside Tailwind CSS v4 for optimal mobile-responsive layouts. PrimeFlex provides specialized utility classes for PrimeNG components, while Tailwind handles general styling.

### CSS Architecture Strategy
```css
/* Layer order for optimal specificity */
@layer reset, primeflex, tailwind, primeng, components;

/* PrimeFlex utilities */
@import 'primeflex/primeflex.css';

/* TailwindCSS utilities */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### PrimeFlex v4 Key Features
- **Grid System**: `grid`, `col-12`, `col-6`, `col-4` for responsive layouts
- **Flexbox**: `flex`, `flex-column`, `justify-content-center`, `align-items-center`
- **Spacing**: `p-0` to `p-8`, `m-0` to `m-8`, `gap-1` to `gap-8`
- **Forms**: `formgrid`, `field`, `field-checkbox` for form layouts
- **Display**: `block`, `inline-block`, `flex`, `grid`, `hidden`
- **Text**: `text-center`, `text-left`, `text-right`, `font-bold`
- **Colors**: `text-primary`, `bg-primary`, `surface-ground`

### Mobile-First Responsive Classes
```html
<!-- PrimeFlex responsive grid -->
<div class="grid">
  <div class="col-12 md:col-6 lg:col-4">
    <!-- Content adapts: mobile full-width, tablet half, desktop third -->
  </div>
</div>

<!-- PrimeFlex + Tailwind combination -->
<div class="grid gap-3 p-4">
  <div class="col-12 sm:col-6">
    <p-card class="h-full shadow-lg rounded-xl">
      <!-- Card content -->
    </p-card>
  </div>
</div>
```

### Form Layout Best Practices
```html
<!-- PrimeFlex form grid -->
<div class="formgrid grid">
  <div class="field col-12 md:col-6">
    <label for="naam">Naam</label>
    <input type="text" pInputText id="naam" class="w-full" />
  </div>
  <div class="field col-12 md:col-6">
    <label for="email">Email</label>
    <input type="email" pInputText id="email" class="w-full" />
  </div>
</div>
```

### Component Layout Patterns

#### Step Container Pattern
```html
<div class="grid grid-nogutter h-screen">
  <!-- Header -->
  <div class="col-12 h-auto">
    <p-toolbar class="border-0 bg-primary">
      <!-- Step navigation -->
    </p-toolbar>
  </div>
  
  <!-- Main Content -->
  <div class="col-12 flex-1 overflow-auto">
    <div class="grid p-4">
      <div class="col-12 lg:col-8 lg:col-offset-2">
        <!-- Step content -->
      </div>
    </div>
  </div>
  
  <!-- Footer Actions -->
  <div class="col-12 h-auto">
    <div class="flex gap-2 p-3">
      <p-button label="Vorige" class="flex-auto" severity="secondary" />
      <p-button label="Volgende" class="flex-auto" />
    </div>
  </div>
</div>
```

#### Card Grid Pattern
```html
<div class="grid gap-3">
  @for (item of items(); track item.id) {
    <div class="col-12 sm:col-6 md:col-4">
      <p-card class="h-full cursor-pointer transition-all duration-200 hover:shadow-lg">
        <ng-template pTemplate="header">
          <img [src]="item.image" class="w-full h-48 object-cover" />
        </ng-template>
        <p class="text-sm text-color-secondary">{{ item.description }}</p>
      </p-card>
    </div>
  }
</div>
```

### Utility Class Combinations

#### PrimeFlex + Tailwind Synergy
```html
<!-- Layout with PrimeFlex, styling with Tailwind -->
<div class="grid p-4 gap-4">
  <div class="col-12 sm:col-6">
    <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
      <h3 class="text-xl font-bold mb-2">Card Title</h3>
      <p class="opacity-90">Card content with gradient background</p>
    </div>
  </div>
</div>

<!-- Form with PrimeFlex structure, Tailwind polish -->
<div class="formgrid grid gap-4">
  <div class="field col-12">
    <label class="block text-sm font-medium mb-2">Photo Upload</label>
    <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
      <i class="pi pi-camera text-4xl text-gray-400 mb-4"></i>
      <p class="text-gray-500">Click to upload or drag and drop</p>
    </div>
  </div>
</div>
```

### Responsive Breakpoints
```css
/* PrimeFlex breakpoints align with modern mobile-first approach */
/* xs: 0px - 575px (mobile) */
/* sm: 576px - 767px (large mobile/small tablet) */
/* md: 768px - 991px (tablet) */
/* lg: 992px - 1199px (small desktop) */
/* xl: 1200px+ (large desktop) */
```

### Performance Optimization
- **Tree-shaking**: Only imported PrimeFlex utilities are included
- **CSS Layers**: Optimal cascade order prevents specificity conflicts
- **Minimal Footprint**: PrimeFlex adds ~15KB gzipped vs Tailwind's full build
- **Component-Specific**: PrimeFlex classes work seamlessly with PrimeNG components

### Migration Notes
- **Gradual Adoption**: Can migrate component-by-component from custom CSS
- **Consistency**: PrimeFlex ensures consistent spacing and typography with PrimeNG
- **Accessibility**: Built-in focus states and ARIA-compatible structures
- **RTL Support**: Full right-to-left language support

### Best Practices
1. **Use PrimeFlex for**: Layout grids, form structures, component spacing
2. **Use Tailwind for**: Custom colors, gradients, advanced styling, animations
3. **Combine Both**: PrimeFlex structure + Tailwind polish = optimal results
4. **Mobile-First**: Always start with mobile layout, then enhance for larger screens
5. **Performance**: Leverage CSS layers to avoid specificity wars

---

**Remember**: Always use Angular 20 modern patterns - signals, control flow, and standalone components!