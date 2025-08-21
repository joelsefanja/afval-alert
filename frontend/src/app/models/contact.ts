/**
 * Model voor contactgegevens van een melder.
 * 
 * @interface Contact
 * @description Bevat contactinformatie van de persoon die een melding doet.
 * Als contact wordt opgegeven, zijn beide velden verplicht.
 */
export interface Contact {
  /** Naam van de melder - verplicht als contact wordt opgegeven */
  naam: string;
  /** E-mailadres voor updates over de melding - verplicht als contact wordt opgegeven */
  email: string;
}