import { Injectable, inject, signal } from '@angular/core';
import { LocatieService } from './locatie.service';
import { KaartControlService } from '../../services/kaart/kaart-control.service';

export interface LocatiePickerData {
  latitude: number;
  longitude: number;
  address: string;
  wijk?: string;
  buurt?: string;
  gemeente?: string;
}

/**
 * LocatiePickerService - Service voor locatie picker logica
 * 
 * Verantwoordelijkheden:
 * - Adres zoekfunctionaliteit
 * - GPS locatie beheer
 * - Kaart interactie coördinatie
 * - Locatie validatie
 * 
 * @example
 * ```typescript
 * constructor(private pickerService: LocatiePickerService) {}
 * 
 * async zoekAdres() {
 *   await this.pickerService.searchAddress(this.searchQuery);
 *   if (this.pickerService.selectedLocation()) {
 *     this.handleSelection();
 *   }
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class LocatiePickerService {
  private locatieService = inject(LocatieService);
  private kaartControl = inject(KaartControlService);

  readonly searchQuery = signal('');
  readonly selectedAddress = signal('');
  readonly selectedLocation = signal<LocatiePickerData | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  async searchAddress(query: string): Promise<void> {
    if (!query.trim()) return;
    
    this.isLoading.set(true);
    try {
      const results = await this.locatieService.searchAddress(query);
      if (results.length > 0) {
        const location = results[0];
        this.selectLocation({
          latitude: location.lat,
          longitude: location.lng,
          address: location.address
        });
      }
    } catch (error) {
      console.error('Address search failed:', error as any);
      console.error('Address search failed:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async getCurrentLocation(): Promise<LocatiePickerData | null> {
    this.isLoading.set(true);
    try {
      const pos = await this.locatieService.getCurrentPosition();
      const address = await this.locatieService.reverseGeocode(pos.lat, pos.lng);
      this.selectLocation({
        latitude: pos.lat,
        longitude: pos.lng,
        address
      });
      return this.selectedLocation();
    } catch (error) {
      console.error('Current location failed:', error as any);
      return null;
    } finally {
      this.isLoading.set(false);
    }
  }

  selectLocation(location: LocatiePickerData): void {
    this.selectedLocation.set(location);
    this.selectedAddress.set(location.address);
    this.kaartControl.setMarker(location.latitude, location.longitude);
  }

  clearSelection(): void {
    this.selectedLocation.set(null);
    this.selectedAddress.set('');
    this.searchQuery.set('');
    this.kaartControl.clearMarker();
  }

  setError(message: string) {
    this.error.set(message);
  }

  clearError() {
    this.error.set(null);
  }
}