import { Injectable } from '@angular/core';
import { IAfvalClassificatieService, AfvalClassificatieResponse } from '../../../interfaces/afval-classificatie.interface';

/**
 * MockClassificatieService - Pure mock implementation
 * Returns realistic mock data without any API calls
 * Use for unit testing or when no network is available
 */
@Injectable({
  providedIn: 'root'
})
export class MockClassificatieService implements IAfvalClassificatieService {

  async classificeerAfval(fotoBlob: Blob): Promise<AfvalClassificatieResponse> {
    // Simulate API delay
    await this.delay(1200);

    // Mock responses using exact 11 categories with realistic confidence distributions
    const mockResponses: AfvalClassificatieResponse[] = [
      {
        afval_typen: [
          { afval_type: "Glas", confidence: 0.95 },
          { afval_type: "Restafval", confidence: 0.08 }
        ]
      },
      {
        afval_typen: [
          { afval_type: "Papier en karton", confidence: 0.92 },
          { afval_type: "Restafval", confidence: 0.15 },
          { afval_type: "Overig", confidence: 0.05 }
        ]
      },
      {
        afval_typen: [
          { afval_type: "Organisch", confidence: 0.84 },
          { afval_type: "Restafval", confidence: 0.45 },
          { afval_type: "Papier en karton", confidence: 0.12 }
        ]
      },
      {
        afval_typen: [
          { afval_type: "Elektronisch afval", confidence: 0.91 },
          { afval_type: "Restafval", confidence: 0.18 }
        ]
      },
      {
        afval_typen: [
          { afval_type: "Textiel", confidence: 0.88 },
          { afval_type: "Restafval", confidence: 0.25 }
        ]
      },
      {
        afval_typen: [
          { afval_type: "Chemisch afval", confidence: 0.76 },
          { afval_type: "Restafval", confidence: 0.35 }
        ]
      },
      {
        afval_typen: [
          { afval_type: "Grofvuil", confidence: 0.82 },
          { afval_type: "Bouw- en sloopafval", confidence: 0.15 }
        ]
      },
      {
        afval_typen: [
          { afval_type: "Geen afval", confidence: 0.97 }
        ]
      }
    ];

    return mockResponses[Math.floor(Math.random() * mockResponses.length)];
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}