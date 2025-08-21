import { Injectable, inject } from '@angular/core';
import { LocatieConfigService } from './services/locatie-config.service';

@Injectable({
  providedIn: 'root'
})
export class AppInitService {
  
  constructor() {
    this.locatieConfigService = inject(LocatieConfigService);
  }
  private locatieConfigService: LocatieConfigService;
  
  initializeApp(): Promise<any> {
    return new Promise((resolve, reject) => {
      console.log('Initializing application configuration...');
      
      // Laad de locatieconfiguratie
      this.locatieConfigService.loadConfig().subscribe({
        next: (config) => {
          console.log('Location configuration loaded successfully', config);
          resolve(true);
        },
        error: (error) => {
          console.error('Failed to load location configuration', error);
          // We reject here because the app can't function properly without the config
          reject(error);
        }
      });
    });
  }
}