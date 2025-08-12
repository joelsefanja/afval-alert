/**
 * Model voor afvalmeldingen.
 * Deze interface definieert de structuur van een afvalmelding in het systeem.
 */
import { AfvalType } from './afval-type.model';

/**
 * Status van een afvalmelding.
 */
export enum AfvalMeldingStatus {
  CONCEPT = 'Concept',           // Initiële status na classificatie, nog niet afgerond
  VERZONDEN = 'Verzonden',       // Melding is afgerond en verzonden
  GEANNULEERD = 'Geannuleerd',   // Melding is geannuleerd door gebruiker
  VERLOPEN = 'Verlopen'          // Melding is verlopen (niet afgerond binnen tijdslimiet)
}

/**
 * Interface voor een afvalmelding.
 */
export interface AfvalMelding {
  id?: string;                   // Unieke identifier (optioneel, wordt gegenereerd)
  fotoUrl?: string;              // URL naar de opgeslagen foto (optioneel)
  fotoBlob?: Blob;               // De foto als Blob (tijdelijk, voor verzending)
  afvalTypes: AfvalType[];       // Gedetecteerde afvaltypes
  locatie?: {
    latitude: number;            // Breedtegraad
    longitude: number;           // Lengtegraad
    adres?: string;              // Optioneel adres (kan later worden toegevoegd)
  };
  tijdstipCreatie: Date;         // Tijdstip waarop de melding is aangemaakt
  tijdstipVerzonden?: Date;      // Tijdstip waarop de melding is verzonden
  status: AfvalMeldingStatus;    // Status van de melding
  contactgegevens?: {            // Optionele contactgegevens (voor toekomstige feature)
    naam?: string;               // Naam van de melder
    email?: string;              // E-mailadres voor updates
  };
}