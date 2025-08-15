import { AfvalType } from './afval-type';
import { AfvalMeldingStatus } from './melding-status';
import { Locatie } from './locatie';
import { Contact } from './contact';

/**
 * Interface voor een afvalmelding.
 * 
 * @interface Melding
 * @description Definieert de volledige structuur van een afvalmelding in het systeem
 */
export interface Melding {
  /** Unieke identifier (optioneel, wordt gegenereerd) */
  id?: string;
  /** URL naar de opgeslagen foto (optioneel) */
  fotoUrl?: string;
  /** De foto als Blob (tijdelijk, voor verzending) */
  fotoBlob?: Blob;
  /** Gedetecteerde afvaltypes */
  afvalTypes: AfvalType[];
  /** Locatie informatie */
  locatie?: Locatie;
  /** Tijdstip waarop de melding is aangemaakt */
  tijdstipCreatie: Date;
  /** Tijdstip waarop de melding is verzonden */
  tijdstipVerzonden?: Date;
  /** Status van de melding */
  status: AfvalMeldingStatus;
  /** Optionele contactgegevens */
  contact?: Contact;
}