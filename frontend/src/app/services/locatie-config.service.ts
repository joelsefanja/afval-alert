import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

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
  boundingBox?: {
    south: number;
    north: number;
    west: number;
    east: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LocatieConfigService {
  private config: LocatieConfig | null = null;
  private http = inject(HttpClient);

  /**
   * Laad de locatie configuratie
   */
  loadConfig(): Observable<LocatieConfig> {
    if (this.config) {
      return of(this.config);
    }

    return this.http.get<LocatieConfig>('assets/config/locatie-config.json').pipe(
      tap(config => {
        this.config = config;

        // Fetch bounding box from Nominatim API
        const nominatimUrl = `${config.nominatim.baseUrl}/search?q=${config.toegestaneGebieden[0].naam}&format=json&polygon-geojson=0&accept-language=nl`;
        this.http.get<any[]>(nominatimUrl).subscribe(
          response => {
            if (response && response.length > 0) {
              const boundingBox = response[0].boundingbox;
              if (boundingBox && boundingBox.length === 4 && this.config) {
                this.config.boundingBox = {
                  south: parseFloat(boundingBox[0]),
                  north: parseFloat(boundingBox[1]),
                  west: parseFloat(boundingBox[2]),
                  east: parseFloat(boundingBox[3])
                };
              }
            }
          },
          error => {
            console.warn('Failed to fetch bounding box from Nominatim API, using default location.');
          }
        );
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
  isToegestaanGebied(latitude: number, longitude: number): boolean {
    if (!this.config || !this.config.boundingBox) {
      return true; // Geen configuratie beschikbaar, alles is toegestaan
    }

    const { south, north, west, east } = this.config.boundingBox;

    return (
      latitude >= south &&
      latitude <= north &&
      longitude >= west &&
      longitude <= east
    );
  }
}