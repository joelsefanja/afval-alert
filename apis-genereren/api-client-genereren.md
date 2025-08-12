# API en Data Handling in dit Project

In dit project is de API vastgelegd in een **OpenAPI 3.1 specificatie** (`openapi.yaml`). Deze file fungeert als een centrale bron voor het automatisch genereren van clients en serverstubs in zowel Angular als Java Spring Boot. Dit zorgt voor:

- Een uniforme en consistente manier van communiceren tussen frontend en backend
- Vermindering van handmatig onderhoud van API-calls en datamodellen

---

## OpenAPI Client Generatie

### Angular
Met tools zoals **openapi-generator** kun je vanuit de YAML-specificatie direct een TypeScript Angular client genereren. Dit zorgt voor:

- Typeveiligheid
- Minder handmatig schrijfwerk

### Java Spring Boot
Ook de backend profiteert door automatisch API controllers, services en DTO’s te genereren.

---

## Afbeeldingen als Blob in plaats van Base64

Voor AI-classificatie en meldingen gebruiken we **blobs** (binary large objects) via `multipart/form-data` uploads in plaats van base64-strings. Dit is efficiënter en voorkomt onnodige:

- Geheugenbelasting
- Overhead in netwerkverkeer
- Verwerkingskosten

---

## Meerdere Circles

De app ondersteunt het markeren van meerdere cirkels op een foto om het exacte afvalgebied te omschrijven. Deze cirkels worden:

- Verzameld in een array
- Meegestuurd als JSON-string in het FormData-veld `circles`

Dit maakt het voor de backend mogelijk om exact te interpreteren waar afval zich bevindt, ook als het verspreid ligt.

---

## Angular Voorbeeld

De bijgevoegde Angular-service laat zien hoe je:

- Meerdere cirkels met signals beheert
- De foto als blob meestuurt
- Locatie en optionele gegevens als JSON of strings verstuurt
- Alles netjes verpakt in een `FormData` object voor een POST-request

Frontend developers kunnen dit voorbeeld eenvoudig copy-pasten en uitbreiden voor hun specifieke UI-interacties.
