# Design Document – Afval Alert

## Overzicht
Afval Alert is een systeem dat inwoners van de gemeente Groningen helpt om zwerfafval te melden. Het systeem bestaat uit:
- Een **burger-app** voor inwoners.
- Een **dashboard** voor gemeente medewerkers.
- Een **AI-module** voor automatische afvalherkenning.
- Een **cloud-gehost** backend met **Spring Boot** en **Angular 20**.

## Systeemarchitectuur

### Belangrijkste onderdelen & datastroom
```mermaid
flowchart TD
    subgraph Presentation
        A[Burger App Componenten] --> B[Angular Services & Signals]
        C[Gemeente Dashboard] --> B
    end

    B --> D[Spring Boot REST Controllers - API Gateway]

    subgraph Application
        D  -. DI .-> IMelding[(IMeldingService)]
        D  -. DI .-> IEmail[(IEmailService)]
        D  -. DI .-> ISecurity[(ISecurityService)]
        IMelding  -.-> E[MeldingService]
        IEmail    -.-> F[EmailService]
        ISecurity -.-> G[SecurityService]
    end

    subgraph Domain
        E --> H[(Domain Entities)]
        F --> H
        G --> H
    end

    subgraph Infrastructure
        IData[(IDataStore)] ==>|DI| PG[(PostgreSQL)]
        IData[(IDataStore)] ==>|DI| H2[(H2 in-memory)]
        H --> IData

        ICache[(ICache)] ==>|DI| RD[(Redis)]
        ICache[(ICache)] ==>|DI| Caffeine[(Caffeine local)]
        H --> ICache

        IAI[(IAIClassifier)] ==>|DI| AZ_AI[(Azure Cognitive Services)]
        IAI[(IAIClassifier)] ==>|DI| Mock_AI[(Stub / Fake AI)]
        H --> IAI

        IStorage[(IBlobStorage)] ==>|DI| AZ_BLOB[(Azure Blob)]
        IStorage[(IBlobStorage)] ==>|DI| FS[(Local filesystem)]
        H --> IStorage

        IEmailSender[(IEmailSender)] ==>|DI| AZ_COMM[(Azure Communication/SendGrid)]
        IEmailSender[(IEmailSender)] ==>|DI| SMTP[(SMTP stub)]
        H --> IEmailSender
    end

    CFG["Spring @Configuration profiles<br>@Profile(local) vs @Profile(azure)"]
    CFG -.-> IData
    CFG -.-> ICache
    CFG -.-> IAI
    CFG -.-> IStorage
    CFG -.-> IEmailSender

    style CFG fill:#e8f5e9,stroke:#388e3c
````

### Gebruikte architectuurpatronen

* **Repository Pattern** – abstractie van data-toegang.
* **Service Layer Pattern** – encapsulatie van bedrijfslogica.
* **DTO Pattern** – overdracht van data tussen lagen.
* **Signals Pattern (Angular)** – reactieve state management (géén klassieke observer pattern, maar pull-based reactive primitives).
* **Strategy Pattern** – verschillende workflows voor meldingen.
* **Factory Pattern** – genereren van e-mailtemplates.

### Dependency Injection

Alle services hebben een interface en meerdere implementaties (lokaal en Azure). Profielen bepalen welke implementatie wordt geladen.

---

## Frontend Architectuur

### Angular 20 Signals – voorbeeld

```typescript
interface MeldingState {
  meldingen: Melding[];
  loading: boolean;
  error: string | null;
  filters: FilterState;
}

class MeldingService {
  private meldingSignal = signal<MeldingState>({
    meldingen: [],
    loading: false,
    error: null,
    filters: initialFilters,
  });

  readonly meldingen = computed(() => this.meldingSignal().meldingen);
  readonly loading = computed(() => this.meldingSignal().loading);

  async loadMeldingen(): Promise<void> {
    this.meldingSignal.update(s => ({ ...s, loading: true }));
    // HTTP-call implementatie
  }
}
```

### Afbeeldingoptimalisatie naar Blob

Foto's worden vóór upload:

1. Geschaald tot max. 1280px breedte.
2. Gecomprimeerd als JPEG (kwaliteit \~0.8).
3. Omgezet naar `Blob`:

```typescript
const blob = await new Promise<Blob>(resolve =>
  canvas.toBlob(resolve, 'image/jpeg', 0.8)
);
formData.append('foto', blob);
```

---

## Burger App Componenten

| Component      | Functie                        |
| -------------- | ------------------------------ |
| PhotoCapture   | Foto maken van afval           |
| LocationPicker | Locatie selecteren             |
| WasteCircle    | Afval markeren op foto         |
| MeldingForm    | Melding valideren en versturen |
| Confirmation   | Bevestiging tonen              |

## Gemeente Dashboard Componenten

| Component     | Functie             |
| ------------- | ------------------- |
| MeldingList   | Lijst met meldingen |
| MeldingMap    | Kaartweergave       |
| MeldingDetail | Detailweergave      |
| FilterPanel   | Filters instellen   |

---

## Backend Architectuur

### Spring Boot Service Layer – voorbeeld

```java
@Service
@Transactional
class MeldingService {
  @Autowired
  private MeldingRepository meldingRepository;
  @Autowired
  private EmailService emailService;
  @Autowired
  private AIClassificationService aiService;

  public Melding processMelding(CreateMeldingDTO dto) {
    Melding melding = createMeldingFromDTO(dto);
    if (dto.getFoto() != null) {
      melding.setAfvaltype(aiService.classifyWaste(dto.getFoto()));
    }
    Melding saved = meldingRepository.save(melding);
    emailService.sendConfirmation(saved);
    return saved;
  }
}
```

---

## REST API Endpoints & Request Bodies

### `POST /api/meldingen`

**Content-Type:** `multipart/form-data`
Body:

* `foto` → Blob (JPEG/PNG, geoptimaliseerd).
* `locatie` → JSON: `{ "latitude": 53.2194, "longitude": 6.5665 }`

---

### `PUT /api/meldingen/{id}/status`

**Content-Type:** `application/json`

```json
{
  "status": "IN_BEHANDELING",
  "opmerkingen": "Wordt morgen opgehaald"
}
```

---

### `POST /api/ai/classify`

**Content-Type:** `application/json`

```json
{
  "imageBase64": "<base64-data>",
  "imageFormat": "jpeg",
  "confidence_threshold": 0.8
}
```

---

## Security (JWT)

Authenticatie via JWT, met CORS restricties op `https://*.gemeente-groningen.nl`.

---

## Data Model

### Core Entities

| Entiteit     | Velden                                             |
| ------------ | -------------------------------------------------- |
| Melding      | id, locatie, foto(blob-URL), afvaltype             |
| StatusUpdate | id, melding, oudeStatus, nieuweStatus, opmerkingen |
| User         | id, username, email, role, lastLogin               |

### Lijsten

* **AfvalType:** PLASTIC, GLAS, PAPIER, ORGANISCH, ELECTRONICA, TEXTIEL, GEVAARLIJK, ONBEKEND
* **MeldingStatus:** NIEUW, IN\_BEHANDELING, GEPLAND, OPGEHAALD
* **UserRole:** ADMIN, OPERATOR, READONLY

---

## AI Integratie

Interfaces:

```typescript
interface AIClassificationRequest {
  imageBase64: string;
  imageFormat: string;
  confidence_threshold?: number;
}

interface AIClassificationResponse {
  predicted_type: AfvalType;
  confidence: number;
  alternatives: Array<{ type: AfvalType; confidence: number }>;
  processing_time_ms: number;
}

interface CircleData {
  centerX: number;
  centerY: number;
  radius: number;
}

```