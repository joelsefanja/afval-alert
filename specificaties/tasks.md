# Requirements Document – Zwerfafval Meldsysteem

## Purpose
- Het Zwerfafval Meldsysteem is een gebruiksvriendelijke webapplicatie
  die burgers in staat stelt om zwerfafval te melden via foto's en
  locatiegegevens.
- Het systeem integreert moderne Angular 20 frontend technologieën met
  signals, Spring Boot backend met security, en AI-classificatie voor
  afvaltype herkenning.

## Functionele Requirements Gebruiker

- **R1** – Als burger wil ik zwerfafval kunnen fotograferen en melden,
  zodat de gemeente het probleem snel en efficiënt kan oplossen.
  - WANNEER ik op "Maak Foto" knop klik DAN opent de camera interface
    binnen 2 seconden met live preview.
  - WANNEER ik een foto maak DAN wordt het afvaltype automatisch
    gedetecteerd door AI-classificatie binnen 5 seconden.
  - WANNEER de foto groter is dan 5MB DAN wordt deze automatisch
    gecomprimeerd naar acceptabele grootte.
  - WANNEER de AI-classificatie onzeker is DAN kan ik handmatig het
    afvaltype selecteren uit voorgedefinieerde categorieën.
  - ALS de camera niet beschikbaar is DAN kan ik een foto uploaden via
    bestandsselectie met dezelfde verwerkingsmogelijkheden.

- **R2** – Als burger wil ik mijn melding nauwkeurig kunnen lokaliseren,
  zodat opruimteams het afval exact kunnen vinden en efficiënt kunnen werken.
  - WANNEER ik een melding start DAN wordt mijn GPS-locatie automatisch
    opgehaald binnen 3 seconden.
  - WANNEER GPS niet beschikbaar is DAN kan ik handmatig een locatie
    selecteren op een interactieve kaart.
  - WANNEER de automatische locatie onjuist is DAN kan ik de pin verslepen
    naar de correcte positie.
  - WANNEER ik buiten gemeente Groningen ben DAN toont het systeem een
    waarschuwing maar accepteert de melding nog steeds.
  - ALS de locatie geselecteerd is DAN toon ik het adres ter bevestiging
    aan de gebruiker.

- **R3** – Als burger wil ik het afval visueel kunnen markeren op mijn foto,
  zodat de gemeente precies weet waar het afval zich bevindt binnen het
  gefotografeerde gebied.
  - WANNEER ik op de foto klik DAN kan ik een cirkel tekenen rond het
    afvalgebied.
  - WANNEER de cirkel te klein is DAN wordt automatisch een minimum radius
    van 2 meter gehanteerd.
  - WANNEER de cirkel buiten foto grenzen valt DAN wordt deze automatisch
    aangepast naar geldige positie.
  - WANNEER meerdere afvalgebieden zichtbaar zijn DAN kan ik meerdere
    cirkels tekenen.
  - ALS de markering geplaatst is DAN kan ik deze verplaatsen of de grootte
    aanpassen voordat ik de melding verstuur.

- **R4** – Als burger wil ik mijn contactgegevens kunnen opgeven, zodat ik
  updates over de voortgang van mijn melding kan ontvangen.
  - WANNEER ik een melding indien DAN zijn naam en email verplichte velden
    voor statusupdates.
  - WANNEER ik een ongeldig emailadres invoer DAN toont het systeem direct
    een validatiefout met correcte voorbeelden.
  - WANNEER alle gegevens correct zijn DAN verstuur ik automatisch een
    bevestigingsmail met uniek meldingsnummer.
  - WANNEER ik geen email wil opgeven DAN kan ik alsnog een melding doen
    maar ontvang geen statusupdates.
  - ALS mijn email correct is DAN ontvang ik notificaties bij elke
    statuswijziging van mijn melding.

- **R5** – Als burger wil ik mijn melding kunnen valideren voordat verzending,
  zodat alle informatie correct is en ik zeker weet dat mijn melding compleet
  is.
  - WANNEER ik op "Verstuur" klik DAN toont het systeem een overzichtscherm
    met alle ingevoerde gegevens.
  - WANNEER gegevens onjuist zijn DAN kan ik teruggaan naar het formulier
    om aanpassingen te maken.
  - WANNEER alle validaties slagen DAN verstuur ik de melding naar de backend
    binnen 3 seconden.
  - WANNEER verzending succesvol is DAN toon ik een bevestiging met
    meldingsnummer op het scherm.
  - ALS verzending mislukt DAN toon ik een duidelijke foutmelding met
    mogelijkheid tot nieuwe poging.

## Functionele Requirements Gemeente Medewerker

- **R6** – Als gemeente medewerker wil ik alle meldingen kunnen overzien,
  zodat ik prioriteiten kan stellen en efficiënt mijn werkzaamheden kan plannen.
  - WANNEER ik het dashboard open DAN zie ik een lijst van alle meldingen
    gesorteerd op datum binnen 2 seconden.
  - WANNEER ik op de kaart toggle klik DAN zie ik alle meldingen als
    gekleurde pins op een interactieve kaart.
  - WANNEER ik filters toepas DAN worden lijst en kaart real-time bijgewerkt
    zonder pagina refresh.
  - WANNEER er nieuwe meldingen binnenkomen DAN worden deze automatisch
    toegevoegd aan mijn overzicht.
  - ALS er meer dan 50 meldingen zijn DAN wordt paginering gebruikt om
    performance te behouden.

- **R7** – Als gemeente medewerker wil ik meldingen kunnen filteren, zodat ik
  specifiek kan zoeken naar meldingen die mijn aandacht behoeven.
  - WANNEER ik een statusfilter selecteer DAN toon alleen meldingen met die
    status binnen 1 seconde.
  - WANNEER ik een afvaltypefilter kies DAN worden alleen relevante meldingen
    getoond.
  - WANNEER ik een datumperiode selecteer DAN filter op meldingsdatum binnen
    het gekozen bereik.
  - WANNEER ik geografische filters gebruik DAN toon alleen meldingen binnen
    het geselecteerde gebied.
  - ALS meerdere filters actief zijn DAN worden alle criteria gecombineerd
    voor nauwkeurige resultaten.

- **R8** – Als gemeente medewerker wil ik meldingdetails kunnen bekijken,
  zodat ik alle benodigde informatie heb om actie te ondernemen.
  - WANNEER ik op een melding klik DAN opent een detailpagina met foto,
    beschrijving en locatiegegevens.
  - WANNEER de detailpagina laadt DAN zie ik een tijdlijn met alle
    statusupdates en timestamps.
  - WANNEER een foto aanwezig is DAN kan ik deze op volledige grootte
    bekijken met zoom functionaliteit.
  - WANNEER cirkels op de foto staan DAN zijn deze duidelijk zichtbaar voor
    exacte localisatie.
  - ALS er contactgegevens beschikbaar zijn DAN kan ik direct de melder
    contacteren.

- **R9** – Als gemeente medewerker wil ik meldingstatus kunnen updaten,
  zodat de voortgang wordt bijgehouden en melders geïnformeerd blijven.
  - WANNEER ik de status wijzig DAN wordt dit direct opgeslagen in de
    database binnen 1 seconde.
  - WANNEER een statusupdate plaatsvindt DAN ontvangt de melder automatisch
    een email notificatie.
  - WANNEER ik opmerkingen toevoeg bij een status wijziging DAN worden deze
    bewaard bij de melding.
  - WANNEER de melding als "opgehaald" wordt gemarkeerd DAN is deze compleet
    afgehandeld.
  - ALS er een systeem fout optreedt DAN blijft de oude status behouden en
    krijg ik een foutmelding.

- **R10** – Als systeem wil ik afvaltype automatisch kunnen herkennen, zodat
  meldingen direct goed gecategoriseerd worden zonder handmatige input.
  - WANNEER een foto wordt geupload DAN verstuur ik deze naar de
    AI-classificatieservice binnen 2 seconden.
  - WANNEER het AI-model een antwoord geeft DAN toon ik het voorgestelde
    afvaltype aan de gebruiker.
  - WANNEER de AI onzeker is over de classificatie DAN toon ik "Onbekend" en
    sta handmatige invoer toe.
  - WANNEER de AI service niet beschikbaar is DAN val ik terug op handmatige
    afvaltype selectie.
  - ALS de gebruiker het AI-voorstel wil wijzigen DAN kan dit altijd handmatig
    overschreven worden.

## Non-Functionele Requirements

### Performance Requirements

- **R11** – Als gebruiker wil ik snelle responstijden ervaren, zodat de
  applicatie prettig en efficiënt in gebruik is.
  - WANNEER ik een API-call maak DAN ontvang ik een response binnen maximaal
    2 seconden.
  - WANNEER ik foto's upload DAN toon een progress indicator tijdens de
    verwerkingstijd.
  - WANNEER ik database queries uitvoer DAN duurt een standaard operatie
    maximaal 500 milliseconden.
  - WANNEER ik tussen pagina's navigeer DAN laadt de nieuwe pagina binnen 1
    seconde.
  - ALS het systeem onder hoge belasting staat DAN blijft de performance binnen
    acceptabele grenzen.

### Security Requirements

- **R12** – Als systeembeheerder wil ik veilige toegang tot het gemeente
  dashboard, zodat gevoelige meldingdata optimaal beschermd is.
  - WANNEER een gemeente medewerker inlogt DAN gebruik `JWT-token`
    authenticatie met 8 uur geldigheidsduur.
  - WANNEER een API-request wordt gemaakt DAN valideer het authorization token
    voordat toegang wordt verleend.
  - WANNEER ongeautoriseerde toegang wordt gedetecteerd DAN log het security
    event en weiger de toegang.
  - WANNEER wachtwoorden worden opgeslagen DAN gebruik `bcrypt` hashing met
    minimaal 12 rounds.
  - ALS verdachte activiteiten worden gedetecteerd DAN blokkeer het account
    en verstuur een alert.

- **R13** – Als systeem wil ik data integriteit waarborgen, zodat alle
  informatie betrouwbaar en consistent blijft.
  - WANNEER data wordt opgeslagen DAN gebruik input validatie en sanitization
    om XSS en SQL injection te voorkomen.
  - WANNEER database toegang plaatsvindt DAN gebruik prepared statements voor
    alle queries.
  - WANNEER gevoelige communicatie plaatsvindt DAN gebruik HTTPS
    versleuteling voor alle API-calls.
  - WANNEER foto's worden opgeslagen DAN scan op malware voordat opslag in
    cloud storage.
  - ALS data corruptie wordt gedetecteerd DAN herstel automatisch van de
    laatste geldige backup.

### Usability Requirements

- **R14** – Als gebruiker wil ik de applicatie op elk apparaat kunnen
  gebruiken, zodat ik overal meldingen kan doen of bekijken.
  - WANNEER ik de app op mobiel open DAN past de layout zich automatisch aan
    zonder functionaliteitsverlies.
  - WANNEER ik touch gestures gebruik DAN reageert de interface natuurlijk en
    intuïtief.
  - WANNEER ik op tablet gebruik DAN profiteer ik van het grotere scherm voor
    betere overzichten.
  - WANNEER ik op desktop werk DAN heb ik toegang tot alle functionaliteiten
    met keyboard shortcuts.
  - ALS de schermgrootte verandert DAN past de layout zich direct en vloeiend
    aan.

### Reliability Requirements

- **R15** – Als systeem wil ik stabiel en betrouwbaar functioneren, zodat
  gebruikers altijd kunnen vertrouwen op de beschikbaarheid van de dienst.
  - WANNEER een component faalt DAN gebruik graceful degradation zonder dat
    de complete applicatie crasht.
  - WANNEER de database niet bereikbaar is DAN toon een gebruiksvriendelijke
    foutmelding met contact informatie.
  - WANNEER foto upload mislukt DAN gebruik een retry mechanisme met maximaal
    3 automatische pogingen.
  - WANNEER externe services (AI) niet beschikbaar zijn DAN val terug op
    handmatige alternatieve workflows.
