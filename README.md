# Afval Alert - Zwerfafval Meldsysteem

Afval Alert is een webapplicatie waarmee inwoners van Groningen zwerfafval kunnen melden. De gemeente kan deze meldingen vervolgens inzien en actie ondernemen.

## Functionaliteiten

*   **Afval Alert App:**
    *   Foto's maken van afval.
    *   Locatie automatisch bepalen (GPS).
    *   Afval markeren op de foto.
    *   Contactgegevens opgeven (optioneel).
    *   Melding versturen.
*   **Gemeente Dashboard:**
    *   Overzicht van alle meldingen.
    *   Filteren op status, type afval, locatie, etc.
    *   Details van meldingen bekijken.
    *   Status van meldingen updaten.

## Technologieën

*   **Frontend:** Angular 20 met Signals
*   **Backend:** Spring Boot
*   **AI:** Azure Cognitive Services (voor afvalherkenning) / Gemini (gratis, kan afval verwerken en antwoorden in JSON geven)
*   **Database:** PostgreSQL / H2 (voor lokale ontwikkeling)
*   **Cloud:** Azure (Blob Storage, Communication Services)

## Setup (Voor Developers)

1.  Clone de repository.
2.  Installeer de dependencies (Angular & Spring Boot).
3.  Configureer de Azure/Gemini services (AI, Blob Storage, etc.).
4.  Start de Angular frontend.
5.  Start de Spring Boot backend.

## Architectuur

De applicatie maakt gebruik van een gelaagde architectuur, met een duidelijke scheiding tussen frontend, backend en AI-module. Dependency Injection wordt gebruikt om de verschillende services te configureren.

## Security

De applicatie maakt gebruik van JWT authenticatie en CORS restricties.

## Meer Informatie

Zie de `specificaties` directory voor meer details over de requirements en het design.