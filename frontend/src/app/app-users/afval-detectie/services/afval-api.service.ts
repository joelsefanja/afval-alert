import { Injectable, inject } from '@angular/core';
import { AfvalType } from '@app/models/afval-type.model';
import { AfvalMelding } from '@app/models/afval-melding.model';
import { IAfvalClassificatieService } from './afval-classificatie.interface';
import { MeldingService } from './melding.service';
import { Observable } from 'rxjs';

/**
 * Service voor het classificeren van afval via de backend API.
 * Deze service implementeert de IAfvalClassificatieService interface
 * en communiceert met de backend API voor afvalclassificatie en meldingen.
 */
@Injectable({
  providedIn: 'root'
})
export class AfvalApiService implements IAfvalClassificatieService {
  private readonly API_URL = '/api';
  private meldingService = inject(MeldingService);
  
  constructor() {}
  
  /**
   * Classificeert afval op basis van een afbeelding via de backend API.
   * Maakt ook een nieuwe conceptmelding aan met de gedetecteerde afvaltypes.
   * 
   * @param imageBlob - De afbeelding als Blob object
   * @returns Een Promise met een array van herkende afvaltypes
   */
  async herkenAfvalSoorten(imageBlob: Blob): Promise<AfvalType[]> {
    // Reset eventuele bestaande meldingen
    this.meldingService.resetMelding();
    
    // Classificeer het afval via de API
    const afvalTypes = await this.classifyWasteViaApi(imageBlob);
    
    // Maak een nieuwe melding aan
    this.meldingService.createMelding(imageBlob, afvalTypes);
    
    return afvalTypes;
  }
  
  /**
   * Annuleert de huidige melding.
   */
  cancelMelding(): void {
    this.meldingService.cancelMelding();
  }
  
  /**
   * Geeft de huidige melding als Observable.
   * 
   * @returns Een Observable van de huidige melding
   */
  getCurrentMelding(): Observable<AfvalMelding | null> {
    return this.meldingService.currentMelding$;
  }
  
  /**
   * Implementatie van de interface methode, roept classificeerAfval aan.
   * 
   * @param imageBlob - De afbeelding als Blob object
   * @returns Een Promise met een array van herkende afvaltypes
   */
  async classifyWaste(imageBlob: Blob): Promise<AfvalType[]> {
    return this.herkenAfvalSoorten(imageBlob);
  }
  
  /**
   * Interne methode die de daadwerkelijke classificatie uitvoert via de API.
   * 
   * @param imageBlob - De afbeelding als Blob object
   * @returns Een Promise met een array van herkende afvaltypes
   */
  private async classifyWasteViaApi(imageBlob: Blob): Promise<AfvalType[]> {
    try {
      // Bereid de FormData voor
      const formData = new FormData();
      formData.append('foto', imageBlob);
      
      // Stuur de aanvraag naar de backend
      const response = await fetch(`${this.API_URL}/classificeer`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`API fout: ${response.status} ${response.statusText}`);
      }
      
      // Verwerk het resultaat
      const result = await response.json();
      return result.afvalTypes as AfvalType[];
    } catch (error) {
      console.error('Fout bij het classificeren van afval via API:', error);
      throw error;
    }
  }
  
  /**
   * Stuurt een afvalmelding naar de backend API.
   * Werkt de huidige melding bij met locatiegegevens en markeert deze als verzonden.
   * 
   * @param imageBlob - De afbeelding als Blob object
   * @param locatie - De locatie waar het afval is gevonden
   * @param afvalTypes - De gedetecteerde of handmatig geselecteerde afvaltypes
   * @returns Een Promise die aangeeft of de melding succesvol is verzonden
   */
  async meldAfval(imageBlob: Blob, locatie: { latitude: number, longitude: number }, afvalTypes: AfvalType[]): Promise<boolean> {
    try {
      // Update de locatie van de huidige melding
      const updatedMelding = this.meldingService.updateLocation(locatie.latitude, locatie.longitude);
      
      if (!updatedMelding) {
        console.error('Geen actieve melding gevonden om te verzenden');
        return false;
      }
      
      // Bereid de FormData voor
      const formData = new FormData();
      formData.append('foto', imageBlob);
      formData.append('locatie', JSON.stringify(locatie));
      formData.append('afvalTypes', JSON.stringify(afvalTypes));
      
      // Stuur de melding naar de backend
      const response = await fetch(`${this.API_URL}/meldingen`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`API fout: ${response.status} ${response.statusText}`);
      }
      
      // Markeer de melding als verzonden
      this.meldingService.markeerMeldingAlsVerzonden();
      
      return true;
    } catch (error) {
      console.error('Fout bij het melden van afval via API:', error);
      return false;
    }
  }
}