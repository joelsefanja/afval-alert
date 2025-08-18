# Stap Indicator Upgrade - Verbeterde Progress Bar

## Overzicht

Deze upgrade vervangt de eenvoudige tekstuele stapindicator ("Stap X van Y") met een moderne, geanimeerde voortgangsbalk die visueel aantoont welke stap de gebruiker zich bevindt in het afvalmeldingsproces.

## Belangrijkste Verbeteringen

### 1. Visuele Voortgangsindicatie
- **Geanimeerde voortgangsbalk**: Een kleurrijke balk die zich vult naarmate de gebruiker vordert door de stappen
- **Stap-cirkels met status**: Elk stap heeft een visuele indicator die toont of deze:
  - Nog moet worden uitgevoerd (grijs)
  - Actief is (blauw met animatie)
  - Voltooid is (groen met vinkje)

### 2. Animaties en Transities
- **Smooth transities**: Alle elementen hebben vloeiende overgangen bij statuswijzigingen
- **Actieve stap animatie**: De huidige stap pulsert zacht om aandacht te trekken
- **Voortgangsanimatie**: De voortgangsbalk vult zich geleidelijk
- **Fade-in effecten**: Nieuwe elementen verschijnen met een subtiele fade-in

### 3. Responsieve Design
- **Mobielvriendelijk**: De indicator past zich aan op kleinere schermen
- **Touch-vriendelijk**: Grotere aanraakgebieden voor mobiel gebruik

## Technische Implementatie

### Component Aanpassingen
Het bestand `afval-melden-procedure.component.ts` is aangepast met:

1. **Nieuwe template structuur** met verbeterde HTML markup
2. **CSS classes** voor animaties en styling
3. **Helper methods** voor dynamische styling op basis van stapstatus
4. **Geoptimaliseerde berekeningen** voor voortgangspercentage

### Styling Toevoegingen
In `styles.css` zijn de volgende animaties toegevoegd:

1. **Custom keyframe animaties** voor pulseren, stuiteren en schuiven
2. **Herbruikbare CSS classes** voor consistente animaties
3. **Responsieve aanpassingen** voor mobiele weergave

## Gebruikte Animaties

### 1. Pulse-grow
Een zachte pulsatie-animatie die elementen laat groeien en weer krimpen

### 2. Bounce-smooth
Een subtiele stuiteranimatie voor de actieve stap

### 3. Slide-in-right
Elementen schuiven in vanaf de rechterkant bij laden

### 4. Fill-progress
De voortgangsbalk vult zich geleidelijk

### 5. Fade-in
Nieuwe elementen verschijnen met een fade-in effect

## Status Indicatoren

### Inactieve Stappen
- Grijze cirkel met grijs nummer
- Lichtgrijze tekst

### Actieve Stappen
- Blauwe cirkel met wit nummer
- Donkerblauwe tekst met vetgedrukte weergave
- Stuiteranimatie
- Schaduweffect

### Voltooide Stappen
- Groene cirkel met wit vinkje
- Donkergroene tekst

## Connectielijnen
Dunne lijnen verbinden de stappen om de voortgang duidelijk te maken:
- Groen voor voltooide stappen
- Grijs voor onvoltooide stappen

## Prestatie-overwegingen

1. **Efficiënte animaties**: Gebruik van CSS transforms en opacity voor betere performance
2. **Beperkte DOM manipulatie**: Minimale JavaScript manipulatie van de DOM
3. **Hardware acceleration**: Gebruik van CSS properties die hardware-versneld worden

## Toekomstige Uitbreidingen

1. **Toegankelijkheid**: Toevoegen van ARIA labels voor schermlezers
2. **Keyboard navigation**: Ondersteuning voor toetsenbordnavigatie tussen stappen
3. **Dark mode**: Verdere optimalisatie voor donkere thema's