import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { InjectionToken } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { IAfvalClassificatieService } from './app-users/afval-detectie/services/afval-classificatie.interface';
import { AfvalClassificatieService } from './app-users/afval-detectie/services/afval-classificatie.service';
import { AfvalApiService } from './app-users/afval-detectie/services/afval-api.service';

// Token voor de afvalclassificatie service
export const AFVAL_CLASSIFICATIE_SERVICE = new InjectionToken<IAfvalClassificatieService>('AFVAL_CLASSIFICATIE_SERVICE');

// Bepaal welke implementatie te gebruiken op basis van environment
const useRealBackend = false; // Zet op true wanneer de backend beschikbaar is

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    {
      provide: AFVAL_CLASSIFICATIE_SERVICE,
      useClass: useRealBackend ? AfvalApiService : AfvalClassificatieService
    }
  ]
};
