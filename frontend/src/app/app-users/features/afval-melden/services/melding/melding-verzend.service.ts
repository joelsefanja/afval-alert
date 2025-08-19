import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MeldingsProcedureStatus, AfvalMeldProcedureStap } from './melding-state.service';
import { MeldingService } from './melding.service';

/**
 * Service voor het verzenden van meldingen
 */
@Injectable({
  providedIn: 'root'
})
export class MeldingVerzendService {
  private afvalMeldProcedureState = inject(MeldingsProcedureStatus);
  private meldingService = inject(MeldingService);
  
  /**
   * Verzamelt de melding gegevens en verstuurt deze
   * @returns Observable die aangeeft of het verzenden succesvol was
   */
  verzendMelding(): Observable<boolean> {
    this.afvalMeldProcedureState.setVerzenden(true);
    
    const melding = {
      fotoUrl: this.afvalMeldProcedureState.fotoUrl(),
      locatieAdres: this.afvalMeldProcedureState.locatieAdres(),
      locatieCoordinaten: {
        lat: this.afvalMeldProcedureState.locatieCoordinaten()!.lat,
        lng: this.afvalMeldProcedureState.locatieCoordinaten()!.long
      },
      contactInfo: this.afvalMeldProcedureState.contactInfo()
    };
    
    return this.meldingService.verzendMelding(melding);
  }
  
  /**
   * Verwerkt een succesvolle verzending
   */
  verwerkSucces(): void {
    this.afvalMeldProcedureState.setVerzenden(false);
    this.afvalMeldProcedureState.setHuidigeStap(AfvalMeldProcedureStap.SUCCES);
  }
  
  /**
   * Verwerkt een fout bij het verzenden
   * @param error De opgetreden fout
   */
  verwerkFout(error: any): void {
    console.error('Fout bij verzenden melding:', error);
    this.afvalMeldProcedureState.setVerzenden(false);
    // Toon foutmelding (niet geïmplementeerd)
  }
}