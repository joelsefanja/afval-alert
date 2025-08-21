import { InjectionToken } from '@angular/core';
import { IAfvalClassificatieService } from '../../interfaces/afval-classificatie.interface';

/**
 * Injection token for afval classificatie service
 * Allows switching between different implementations
 */
export const AFVAL_CLASSIFICATIE_SERVICE = new InjectionToken<IAfvalClassificatieService>(
  'AfvalClassificatieService',
  {
    providedIn: 'root',
    factory: () => {
      // Default to mock service for development
      // Override in main.ts or app.config.ts for production
      throw new Error('AFVAL_CLASSIFICATIE_SERVICE must be provided');
    }
  }
);