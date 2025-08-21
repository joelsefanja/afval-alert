import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '@environments/environment';

export interface FotoUploadResponse {
  id: number;
}

export interface MeldingData {
  lat: number;
  lon: number;
  email: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class FotoUploadService {
  private baseUrl = environment.apiUrl;
  private meldingIdSubject = new BehaviorSubject<number | null>(null);
  public meldingId$ = this.meldingIdSubject.asObservable();

  constructor(private http: HttpClient) {
    // Probeer opgeslagen melding ID te herstellen bij initialisatie
    const savedId = sessionStorage.getItem('meldingId');
    if (savedId) {
      const id = parseInt(savedId, 10);
      if (!isNaN(id)) {
        this.meldingIdSubject.next(id);
      }
    }
  }

  /**
   * Upload een foto naar de backend en ontvang een melding ID
   * @param fotoBlob De foto als Blob
   * @returns Observable met het melding ID
   */
  uploadFoto(fotoBlob: Blob): Observable<FotoUploadResponse> {
    const formData = new FormData();
    formData.append('file', fotoBlob, 'foto.jpg');
    
    return this.http.post<{ id: number }>(`${this.baseUrl}/api/image`, formData)
      .pipe(
        map(response => {
          // Sla het melding ID op in de BehaviorSubject en sessionStorage
          this.meldingIdSubject.next(response.id);
          sessionStorage.setItem('meldingId', response.id.toString());
          return { id: response.id };
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Verstuur de volledige melding naar de backend
   * @param meldingId Het melding ID dat tijdens de foto-upload is ontvangen
   * @param meldingData De melding data
   * @returns Observable met de response
   */
  verstuurMelding(meldingId: number, meldingData: MeldingData): Observable<any> {
    return this.http.put(`${this.baseUrl}/api/melding/${meldingId}`, meldingData)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Verwijder het opgeslagen melding ID
   */
  clearMeldingId(): void {
    this.meldingIdSubject.next(null);
    sessionStorage.removeItem('meldingId');
  }

  /**
   * Haal het opgeslagen melding ID op
   */
  getMeldingId(): number | null {
    return this.meldingIdSubject.value;
  }

  /**
   * Stel het melding ID handmatig in
   */
  setMeldingId(id: number): void {
    this.meldingIdSubject.next(id);
    sessionStorage.setItem('meldingId', id.toString());
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Er is een onbekende fout opgetreden';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}
Message: ${error.message}`;
    }
    
    console.error(errorMessage);
    return throwError(() => errorMessage);
  }
}