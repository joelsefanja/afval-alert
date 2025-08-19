import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import { nl } from "primelocale/js/nl.js"

import { routes } from './app.routes';
import { AppInitService } from './app-init.service';

// @ts-ignore
import Aura from '@primeuix/themes/aura';

// App initialisatie functie
export function initializeApp(appInitService: AppInitService) {
  return (): Promise<any> => {
    return appInitService.initializeApp();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    providePrimeNG({
      translation: nl,
      theme: {
        preset: Aura,
          options: {
            cssLayer: {
              name: 'primeng',
              order: 'theme, base, primeng'
            }
          }
        }
      }),
    provideAnimations(),
    AppInitService,
    {
      provide: 'APP_INITIALIZER',
      useFactory: initializeApp,
      deps: [AppInitService],
      multi: true
    }
  ]
};





