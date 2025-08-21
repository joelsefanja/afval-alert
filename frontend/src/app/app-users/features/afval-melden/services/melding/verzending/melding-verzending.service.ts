import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MeldingConceptService } from '../concept/melding-concept.service';
import { NetworkService } from '../../netwerk/network.service';
// import { environment } from '../../../../../environments/environment';

export interface VerzendStatus {
  bezig: boolean;
  geslaagd: boolean;
  foutmelding: string | null;
  meldingId: string | null;
}

/**
 * Melding verzending service
 * Focused op het versturen van meldingen
 */
@Injectable({ providedIn: 'root' })
export class MeldingVerzendingService {
  private readonly http = inject(HttpClient);
  private readonly concept = inject(MeldingConceptService);
  private readonly netwerk = inject(NetworkService);
  
  // State
  private readonly _verzendStatus = signal<VerzendStatus>({
    bezig: false,
    geslaagd: false,
    foutmelding: null,
    meldingId: null
  });
  
  // Public readonly signal
  readonly verzendStatus = this._verzendStatus.asReadonly();
  
  async verstuurMelding(): Promise<string> {
    if (this._verzendStatus().bezig) {
      throw new Error('Er wordt al een melding verstuurd');
    }
    
    if (!this.concept.isVolledig()) {
      throw new Error('Melding is niet volledig');
    }
    
    // Check network
    if (!this.netwerk.isOnline) {
      throw new Error('Geen internetverbinding');
    }
    
    this._verzendStatus.set({
      bezig: true,
      geslaagd: false,
      foutmelding: null,
      meldingId: null
    });
    
    try {
      const backendData = this.concept.exporteerVoorBackend();
      const response = await this.verstuurNaarBackend(backendData);
      
      this._verzendStatus.set({
        bezig: false,
        geslaagd: true,
        foutmelding: null,
        meldingId: response.meldingId
      });
      
      return response.meldingId;
    } catch (error) {
      const foutmelding = this.vertaalVerzendFout(error);
      
      this._verzendStatus.set({
        bezig: false,
        geslaagd: false,
        foutmelding,
        meldingId: null
      });
      
      throw new Error(foutmelding);
    }
  }
  
  private async verstuurNaarBackend(data: any): Promise<{meldingId: string}> {
    const url = `${'/api'}/meldingen`; // TODO: Use environment
    
    return this.http.post<{meldingId: string}>(url, data, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 seconds
    }).toPromise() as Promise<{meldingId: string}>;
  }
  
  resetVerzendStatus(): void {
    this._verzendStatus.set({
      bezig: false,
      geslaagd: false,
      foutmelding: null,
      meldingId: null
    });
  }
  
  private vertaalVerzendFout(error: unknown): string {
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        return 'Verzending duurde te lang. Probeer opnieuw.';
      }
      if (error.message.includes('network')) {
        return 'Geen internetverbinding. Controleer je verbinding.';
      }
      if (error.message.includes('400')) {
        return 'Ongeldige melding gegevens.';
      }
      if (error.message.includes('500')) {
        return 'Server fout. Probeer later opnieuw.';
      }
      return error.message;
    }
    
    return 'Onbekende fout bij verzenden';
  }
}