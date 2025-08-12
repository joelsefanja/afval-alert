import { AfvalType } from '@app/models/afval-type.model';
import { AfvalMelding } from '@app/models/afval-melding.model';
import { Observable } from 'rxjs';

/**
 * Interface voor afvalclassificatie services.
 * Deze interface definieert de methoden die nodig zijn voor het classificeren van afval
 * op basis van afbeeldingen, ongeacht of dit via een lokale service of een externe API gebeurt.
 */
export interface IAfvalClassificatieService {
  /**
   * Classificeert afval op basis van een afbeelding.
   * Deze methode is voor compatibiliteit met de interface.
   * 
   * @param imageBlob - De afbeelding als Blob object
   * @returns Een Promise met een array van herkende afvaltypes
   */
  classifyWaste(imageBlob: Blob): Promise<AfvalType[]>;
  
  /**
   * Classificeert afval op basis van een afbeelding en maakt een nieuwe melding aan.
   * Dit is de aanbevolen methode voor het classificeren van afval.
   * 
   * @param imageBlob - De afbeelding als Blob object
   * @returns Een Promise met een array van herkende afvaltypes
   */
  herkenAfvalSoorten(imageBlob: Blob): Promise<AfvalType[]>;

  /**
   * Stuurt een afvalmelding naar de backend.
   * 
   * @param imageBlob - De afbeelding als Blob object
   * @param locatie - De locatie waar het afval is gevonden
   * @param afvalTypes - De gedetecteerde of handmatig geselecteerde afvaltypes
   * @returns Een Promise die aangeeft of de melding succesvol is verzonden
   */
  meldAfval(imageBlob: Blob, locatie: { latitude: number, longitude: number }, afvalTypes: AfvalType[]): Promise<boolean>;
  
  /**
   * Annuleert de huidige melding.
   */
  cancelMelding(): void;
  
  /**
   * Geeft de huidige melding als Observable.
   * 
   * @returns Een Observable van de huidige melding
   */
  getCurrentMelding(): Observable<AfvalMelding | null>;
}