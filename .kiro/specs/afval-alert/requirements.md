# Requirements Document – Afval Alert

## Doel
- Afval Alert is een app voor inwoners van gemeente Groningen.
- Je kunt er foto's van zwerfafval mee maken en doorsturen.
- De gemeente kan het afval dan opruimen.
- De app is makkelijk te gebruiken.

## Wat gebruikers willen

- **R1** – Ik wil een foto van zwerfafval maken en versturen.
  1. Als ik op "Maak Foto" klik, gaat de camera aan.
  2. De app herkent automatisch wat voor afval het is.
  3. Grote foto's worden automatisch kleiner gemaakt.
  4. Als de app het afval niet herkent, kan ik het zelf kiezen.
  5. Als de camera niet werkt, kan ik een foto uploaden.

- **R2** – Ik wil precies laten zien waar het afval ligt.
  1. De app vindt automatisch mijn locatie.
  2. Als mijn locatie niet klopt, kan ik hem aanpassen.
  3. Als ik buiten de gemeente ben, krijg ik een waarschuwing.
  4. Ik zie het adres van de locatie.

- **R3** – DEPRICATED - Ik wil op de foto laten zien waar het afval ligt.

- **R4** – Ik wil mijn contactgegevens invullen.
  1. Ik moet mijn naam en email invullen voor updates.
  2. Als mijn email niet klopt, krijg ik een foutmelding.
  3. Als alles klopt, krijg ik een bevestiging met een nummer.
  4. Ik hoef geen email in te vullen, maar krijg dan geen updates.
  5. Als mijn email klopt, krijg ik updates over mijn melding.

- **R5** – Ik wil mijn melding controleren voordat ik hem verstuur.
  1. Als ik op "Verstuur" klik, zie ik een overzicht van mijn melding.
  2. Als er iets niet klopt, kan ik het aanpassen.
  3. Als alles klopt, wordt mijn melding verstuurd.
  4. Als het versturen lukt, krijg ik een bevestiging.
  5. Als het versturen niet lukt, krijg ik een foutmelding.
     - Mogelijk afbeelding bufferen en later uploaden naar backend.   

## Wat gemeente medewerkers willen

- **R6** – Ik wil alle meldingen kunnen zien.
  1. Als ik het dashboard open, zie ik een lijst van meldingen.
  2. Ik kan een kaart zien met alle meldingen.
  3. Ik kan filters gebruiken om meldingen te zoeken.
  4. Nieuwe meldingen worden automatisch toegevoegd.
  5. Als er veel meldingen zijn, worden ze verdeeld over pagina's.

- **R7** – Ik wil meldingen kunnen filteren.
  1. Ik kan filteren op status, type afval, datum en locatie.
  2. Als ik meerdere filters gebruik, worden ze gecombineerd.

- **R8** – Ik wil details van meldingen kunnen zien.
  1. Als ik op een melding klik, zie ik alle details.
  2. Ik zie een tijdlijn met alle updates van de melding.
  3. Ik kan foto's vergroten en inzoomen.

- **R9** – Ik wil de status van meldingen kunnen updaten.
  1. Als ik de status update, wordt dit opgeslagen.
  2. De melder krijgt een email als de status verandert.
  3. Ik kan opmerkingen toevoegen bij een status update.
  4. Als een melding als "opgehaald" wordt gemarkeerd, is hij klaar.
  5. Als er een fout optreedt, blijft de oude status behouden.

# Voor de backend
- **R10** – Ik wil dat de app automatisch herkent wat voor afval het is.
  1. De app toont het herkende afvaltype.

## Niet-functionele eisen

### Snelheid

- **R11** – Ik wil dat de app snel werkt.
  1. Ik krijg snel een reactie op mijn acties.
  2. Ik zie een voortgangsindicator bij het uploaden van foto's.
  3. De app laadt snel nieuwe pagina's.
  4. De app blijft snel werken, ook als hij druk bezig is.

### Beveiliging

- **R12** – Ik wil dat het dashboard van de gemeente veilig is.
  1. Medewerkers loggen in met een token dat 1 uur geldig is.
  2. De app controleert altijd of iemand toegang mag hebben.
  3. Ongeautoriseerde toegang wordt geblokkeerd en gelogd.
  4. Wachtwoorden worden veilig opgeslagen.
  5. Verdachte activiteiten worden geblokkeerd en gemeld.

- **R13** – Ik wil dat alle data veilig en betrouwbaar is.
  1. De app controleert en maakt data schoon voordat hij wordt opgeslagen.
  2. De app gebruikt veilige methodes voor database toegang.
  3. Alle communicatie is versleuteld.
  4. Foto's worden gecontroleerd op malware voordat ze worden opgeslagen.
  5. Als data beschadigd raakt, wordt hij hersteld vanuit een backup.

### Gebruiksvriendelijkheid

- **R14** – Ik wil de app op elk apparaat kunnen gebruiken.
  1. De app past zich automatisch aan op mobiel.
  2. De app reageert natuurlijk op aanraking.
  3. Optioneel - De app maakt goed gebruik van grotere schermen.
  4. De app werkt goed met een toetsenbord. Dat toetsten bord niet in de weg van de UI zit.
  
### Betrouwbaarheid

- **R15** – Ik wil dat de app altijd werkt.
  1. Als een onderdeel niet werkt, blijft de rest van de app werken.
  2. Als de database niet werkt, krijg ik een duidelijke melding.
  3. Als het uploaden van een foto niet lukt, probeert de app het opnieuw.