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
- **TailwindCSS** - Utility-first CSS framework
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

**Remember**: Always use Angular 20 modern patterns - signals, control flow, and standalone components!