# UI/UX Tips voor de Afval Alert App (Groningen) - Gebaseerd op Specificaties

Deze gids geeft UI/UX tips voor de Afval Alert app, gebaseerd op de requirements.

## Afval Alert App - Voor burgers (R1-R5)

**R1: Melding Maken**

*   "Maak Foto" knop: Snel openen (binnen 2s). Gebruik `mat-fab`.
*   AI Afvaldetectie: Toon resultaat snel (binnen 5s).
    *   Willen we deze feedback / categorieën ook aan gebruiker tonen? 
*   Foto Compressie: Automatisch voor grote foto's.
*   Optioneel voor later -> Bestandsselectie: Alternatief als camera niet werkt.

**R2: Locatie Nauwkeurig Bepalen**

*   GPS: Automatisch ophalen (binnen 3s). / GEO Data uit foto gebruiken.
*   Kaart: Handmatige locatie selectie of ingesteld locatie zien.
*   Pin: Verslepen voor correcte positie.
*   Waarschuwing: Buiten Groningen neem circel afstand vanaf Groningen.

**R5: Melding Valideren**

*   Overzicht: Alle gegevens voor verzending.
*   Terug Navigeren: Aanpassingen maken.
*   Bevestiging: met kort bericht.
*   Foutmelding: Bij mislukte verzending.

## Afval Alert App - Voor gemeente medewerker

**R6: Meldingen Overzien**
*   Lijst: Gesorteerd op datum (binnen 2s).
*   Kaart: Meldingen als pins.
*   Filters: Real-time bijwerken.
*   Paginering: Voor performance (bij >50 meldingen).

**R7: Meldingen Filteren**

*   Status Filter: Snel resultaat (binnen 1s).
*   Afvaltype Filter.
*   Datumperiode Filter.
*   Geografische Filters.

**R8: Meldingdetails Bekijken**

*   Detailpagina: Foto, beschrijving, locatie.
*   Tijdlijn: Statusupdates.
*   Foto Zoom: Volledige grootte bekijken.

**R9: Meldingstatus Updaten**

*   Direct Opslaan: Binnen 1 seconde.
*   Opmerkingen: Toevoegen bij statuswijziging.

## Usability (R14)

*   Responsive Design: Werkt goed op mobiel, tablet, desktop.
*   Touch Gestures: Intuïtieve interface.
*   Keyboard Shortcuts: Op desktop.
