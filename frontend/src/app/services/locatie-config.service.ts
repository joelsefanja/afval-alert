import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface ToegestaanGebied {
  naam: string;
  type: string;
  land: string;
}

export interface NominatimConfig {
  baseUrl: string;
  reverseZoom: number;
  searchZoom: number;
  addressdetails: number;
  format: string;
}

export interface LocatieConfig {
  versie: string;
  toegestaneGebieden: ToegestaanGebied[];
  nominatim: NominatimConfig;
}

@Injectable({
  providedIn: 'root'
})
export class LocatieConfigService {
  private config: LocatieConfig | null = null;

  constructor(private http: HttpClient) {}

  /**
   * Laad de locatie configuratie
   */
  loadConfig(): Observable<LocatieConfig> {
    if (this.config) {
      return of(this.config);
    }

    return this.http.get<LocatieConfig>('config/locatie-config.json').pipe(
      catchError(() => {
        // Fallback naar default configuratie als het bestand niet geladen kan worden
        const defaultConfig: LocatieConfig = {
          versie: '1.0',
          toegestaneGebieden: [
            {
              naam: 'Groningen',
              type: 'gemeente',
              land: 'Nederland'
            }
          ],
          nominatim: {
            baseUrl: 'https://nominatim.openstreetmap.org',
            reverseZoom: 18,
            searchZoom: 18,
            addressdetails: 1,
            format: 'json'
          }
        };
        this.config = defaultConfig;
        return of(defaultConfig);
      }),
      map(config => {
        this.config = config;
        return config;
      })
    );
  }

  /**
   * Haal de huidige configuratie op
   */
  getConfig(): LocatieConfig | null {
    return this.config;
  }

  /**
   * Controleer of een adres in een toegestaan gebied ligt
   */
  isToegestaanGebied(address: any): boolean {
    if (!this.config) {
      return true; // Geen configuratie beschikbaar, alles is toegestaan
    }

    // Haal gemeente/provincie uit adresgegevens
    const gemeente = address.municipality || address.city || address.town || address.village;
    const provincie = address.state || address.county;
    
    // Controleer of minstens één van de toegestane gebieden overeenkomt
    return this.config.toegestaneGebieden.some(gebied => {
      // Controleer op naam overeenkomst (gemeente of provincie)
      if (gebied.type === 'gemeente' && gemeente && 
          gebied.naam.toLowerCase() === gemeente.toLowerCase()) {
        return true;
      }
      
      if (gebied.type === 'provincie' && provincie && 
          gebied.naam.toLowerCase() === provincie.toLowerCase()) {
        return true;
      }
      
      return false;
    });
  }
}