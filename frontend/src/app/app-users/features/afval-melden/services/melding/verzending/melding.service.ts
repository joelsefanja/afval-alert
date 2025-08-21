import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MeldingVerzendRequest, MeldingVerzendResponse } from '@models/afval-herkenning';

@Injectable({
  providedIn: 'root'
})
export class MeldingService {
  /**
   * Verzend een afval melding naar de backend
   * @param melding De afval melding om te verzenden
   * @returns Een observable die true retourneert als het verzenden is gelukt
   */
  verzendMelding(melding: MeldingVerzendRequest): Observable<MeldingVerzendResponse> {
    // Simuleer een API call met een vertraging van 1.5 seconden
    console.log('Melding verzenden:', melding);
    
    // In een echte applicatie zou hier een HTTP request naar de backend worden gedaan
    // return this.http.post<boolean>('/api/meldingen', melding);
    
    return of({
      success: true,
      meldingId: Math.random().toString(36).substr(2, 9),
      message: 'Melding succesvol verzonden'
    }).pipe(delay(1500));
  }
}