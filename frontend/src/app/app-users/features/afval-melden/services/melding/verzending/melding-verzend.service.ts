import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MeldingService } from './melding.service';
import { ProcesBuilderService } from '../../proces/navigatie/proces-builder.service';
import { MeldingStateService } from '../state/melding-state.service';
import { MeldingVerzendRequest, MeldingVerzendResponse } from '@models/afval-herkenning';
import { Contact } from '@interfaces/melding.interface';

/**
 * Service voor het verzenden van meldingen
 */
@Injectable({
  providedIn: 'root'
})
export class MeldingVerzendService {
  private procesBuilder = inject(ProcesBuilderService);
  private meldingService = inject(MeldingService);
  private meldingStateService = inject(MeldingStateService);
  
  /**
   * Verzamelt de melding gegevens en verstuurt deze
   * @returns Observable die aangeeft of het verzenden succesvol was
   */
  verzendMelding(): Observable<MeldingVerzendResponse> {
    const melding = this.meldingStateService.meldingData();
    const uuid = this.meldingStateService.getMeldingUuid();
    
    if (!melding || !uuid) {
      throw new Error('Geen melding data of UUID beschikbaar');
    }
    
    if (!melding.locatie?.latitude || !melding.locatie?.longitude) {
      throw new Error('Locatie coördinaten zijn verplicht');
    }
    
    // Nieuwe payload: alleen UUID, coördinaten, en optionele contact info
    const request: any = {
      id: uuid,
      latitude: melding.locatie.latitude,
      longitude: melding.locatie.longitude,
      afbeeldingUrl: '', // Legacy field for compatibility
      afvalTypes: [], // Legacy field for compatibility
      locatie: melding.locatie,
      contact: melding.contact,
      ...(melding.contact && !(melding.contact as Contact).anoniem && {
        contactNaam: (melding.contact as Contact).naam,
        contactEmail: melding.contact.email
      })
    };
    
    console.log('Verzenden melding met payload:', request);
    
    return this.meldingService.verzendMelding(request);
  }
  
  /**
   * Verwerkt een succesvolle verzending
   */
  verwerkSucces(): void {
    // Navigate to the success step (assuming it's the last step)
    // In the new approach, we use the proces builder to navigate
    this.procesBuilder.volgende();
  }
  
  /**
   * Verwerkt een fout bij het verzenden
   * @param error De opgetreden fout
   */
  verwerkFout(error: any): void {
    console.error('Fout bij verzenden melding:', error);
    // In the new approach, error handling would be done in the component
    // or a separate error handling service
  }
}