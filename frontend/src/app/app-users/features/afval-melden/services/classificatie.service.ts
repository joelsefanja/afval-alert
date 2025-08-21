import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AfvalClassificatieResponse } from '../interfaces/afval-classificatie.interface';

/**
 * Productie classificatie service
 * Praat direct met Python backend op poort 8000
 */
@Injectable({ providedIn: 'root' })
export class ClassificatieService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8000/classificatie';

  async classificeerAfval(fotoBlob: Blob): Promise<AfvalClassificatieResponse> {
    try {
      const formData = new FormData();
      formData.append('image', fotoBlob, 'foto.jpg');

      // Backend returns: [{"type": "Glas", "confidence": 0.95}, {"type": "Plastic", "confidence": 0.87}]
      const backendResponse = await this.http.post<Array<{type: string; confidence: number}>>(
        this.apiUrl,
        formData,
        { timeout: 30000 }
      ).toPromise();

      if (!backendResponse || !Array.isArray(backendResponse)) {
        throw new Error('Ongeldige response van classificatie service');
      }

      // Filter en valideer
      const validResults = backendResponse.filter(item => 
        item.confidence > 0 && 
        item.confidence <= 1 &&
        typeof item.type === 'string'
      );

      return { afval_typen: validResults };

    } catch (error) {
      console.error('Classificatie service error:', error);
      throw new Error('Afval classificatie mislukt');
    }
  }
}