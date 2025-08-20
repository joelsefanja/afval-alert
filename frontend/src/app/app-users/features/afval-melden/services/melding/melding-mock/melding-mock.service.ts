import { Injectable, inject } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { IMeldingService } from '../../../interfaces/melding.interface';
import { MeldingConcept } from '@models/melding-concept';
import { MeldingVerzendRequest, MeldingVerzendResponse } from '@models/afval-herkenning';
import { SessieStorageService } from '../../opslag/sessie-storage.service';

@Injectable({
  providedIn: 'root'
})
export class MeldingMockService implements IMeldingService {
  private sessieStorage = inject(SessieStorageService);

  getMeldingConcept(meldingId: string): Observable<MeldingConcept | null> {
    return this.sessieStorage.getMeldingConcept(meldingId);
  }

  slaaMeldingConceptOp(melding: MeldingConcept): Observable<boolean> {
    return this.sessieStorage.slaaMeldingConceptOp(melding);
  }

  verzendMelding(request: MeldingVerzendRequest): Observable<MeldingVerzendResponse> {
    // Simuleer netwerk vertraging
    const verwerkingsTijd = Math.random() * 1500 + 500; // 0.5-2 seconden
    
    // Simuleer soms een fout
    if (Math.random() < 0.03) { // 3% kans op fout
      return throwError(() => new Error('Melding kon niet worden verzonden. Probeer het opnieuw.')).pipe(
        delay(verwerkingsTijd)
      );
    }

    // Eenvoudige success response
    const response: MeldingVerzendResponse = {
      success: true,
      meldingId: Math.random().toString(36).substr(2, 9),
      message: 'Melding succesvol verzonden (mock)'
    };

    return of(response).pipe(delay(verwerkingsTijd));
  }

  verwijderMeldingConcept(meldingId: string): Observable<boolean> {
    return this.sessieStorage.verwijderMeldingConcept(meldingId);
  }


}