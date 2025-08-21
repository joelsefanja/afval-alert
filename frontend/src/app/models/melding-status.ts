/**
 * Status van een afvalmelding.
 * 
 * @enum AfvalMeldingStatus
 * @description Mogelijke statussen die een afvalmelding kan hebben tijdens de levenscyclus
 */
export enum AfvalMeldingStatus {
  /** Initiële status na classificatie, nog niet afgerond */
  CONCEPT = 'Concept',
  /** Melding is afgerond en verzonden */
  VERZONDEN = 'Verzonden',
  /** Melding is geannuleerd door gebruiker */
  GEANNULEERD = 'Geannuleerd',
  /** Melding is verlopen (niet afgerond binnen tijdslimiet) */
  VERLOPEN = 'Verlopen'
}