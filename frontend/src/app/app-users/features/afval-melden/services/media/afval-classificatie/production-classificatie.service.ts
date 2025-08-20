import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IAfvalClassificatieService, AfvalClassificatieResponse } from '../../../interfaces/afval-classificatie.interface';

/**
 * ProductionClassificatieService - Production microservice implementation
 * Sends image to Python microservice for waste classification
 */
@Injectable({
  providedIn: 'root'
})
export class ProductionClassificatieService implements IAfvalClassificatieService {
  private readonly http = inject(HttpClient);
  
  // TODO: Move to environment config
  private readonly apiUrl = 'https://api.afval-alert.nl/classificatie/analyze';

  async classificeerAfval(fotoBlob: Blob): Promise<AfvalClassificatieResponse> {
    try {
      const formData = new FormData();
      formData.append('image', fotoBlob, 'waste-image.jpg');

      const response = await this.http.post<AfvalClassificatieResponse>(
        this.apiUrl,
        formData,
        {
          headers: {
            // Don't set Content-Type, let browser set multipart/form-data with boundary
          }
        }
      ).toPromise();

      if (!response) {
        throw new Error('Geen response van classificatie service');
      }

      // Validate response structure
      if (!response.afval_typen || !Array.isArray(response.afval_typen)) {
        throw new Error('Ongeldige response structuur');
      }

      // Filter and validate confidence scores
      response.afval_typen = response.afval_typen.filter((item: any) => 
        item.confidence > 0 && 
        item.confidence <= 1 &&
        typeof item.afval_type === 'string'
      );

      return response;

    } catch (error) {
      console.error('Productie classificatie service fout:', error);
      
      // Check if it's a network/timeout error
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          throw new Error('Classificatie service timeout - probeer opnieuw');
        }
        if (error.message.includes('network') || error.message.includes('fetch')) {
          throw new Error('Classificatie service niet bereikbaar');
        }
      }
      
      throw new Error('Afval classificatie mislukt');
    }
  }
}