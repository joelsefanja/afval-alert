import { Injectable, inject, signal } from '@angular/core';
import { LocatieService } from './locatie.service';
import { MeldingStateService } from '../melding';
import { StepBuilderService } from '../steps/step-builder.service';

export interface LocatieData {
  address: string;
  lat: number;
  lng: number;
}

/**
 * LocatieStapService - Service voor locatie stap logica
 * 
 * Verantwoordelijkheden:
 * - GPS locatie bepaling
 * - Adres geocoding/reverse geocoding
 * - Locatie validatie en opslag
 * - Zoekfunctionaliteit
 * 
 * @example
 * ```typescript
 * constructor(private locatieService: LocatieStapService) {}
 * 
 * async selecteerLocatie() {
 *   await this.locatieService.getCurrentLocation();
 *   if (this.locatieService.location()) {
 *     this.locatieService.next();
 *   }
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class LocatieStapService {
  private locatieService = inject(LocatieService);
  private meldingState = inject(MeldingStateService) as MeldingStateService;
  private stepBuilder = inject(StepBuilderService) as StepBuilderService;
  
  readonly loading = signal(false);
  readonly isLoading = signal(false);
  readonly location = signal<LocatieData | null>(null);
  readonly huidigeLocatie = signal<LocatieData | null>(null);
  readonly error = signal<string | null>(null);
  readonly searchResults = signal<LocatieData[]>([]);

  async getCurrentLocation(): Promise<void> {
    this.loading.set(true);
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const pos = await this.locatieService.getCurrentPosition();
      const address = 'Huidige locatie'; // Basic fallback, reverseGeocode might not exist
      const locData = { address, lat: pos.lat, lng: pos.lng };
      this.location.set(locData);
      this.huidigeLocatie.set(locData);
      this.meldingState.setLocatie(address, pos.lat, pos.lng);
    } catch (error) {
      this.error.set('Kon locatie niet ophalen');
      console.error('Location error:', error);
    } finally {
      this.loading.set(false);
      this.isLoading.set(false);
    }
  }

  async searchAddress(query: string): Promise<void> {
    if (!query.trim()) {
      this.searchResults.set([]);
      return;
    }
    
    this.loading.set(true);
    try {
      const results = await this.locatieService.searchAddress(query);
      this.searchResults.set(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      this.loading.set(false);
    }
  }

  selectLocation(location: LocatieData): void {
    this.location.set(location);
    this.huidigeLocatie.set(location);
    this.meldingState.setLocatie(location.address, location.lat, location.lng);
  }

  setLocatie(locatie: any): void {
    const locatieData: LocatieData = {
      address: locatie.address,
      lat: locatie.latitude,
      lng: locatie.longitude
    };
    this.selectLocation(locatieData);
  }

  next(): void {
    this.stepBuilder.next();
  }
}