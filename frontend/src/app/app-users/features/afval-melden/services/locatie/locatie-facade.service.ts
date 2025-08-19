import { Injectable, inject, signal, computed } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, takeUntil, Observable } from 'rxjs';
import { LocatieService } from './locatie.service';

export interface LocatieInfo {
  latitude: number;
  longitude: number;
  address: string;
  wijk?: string;
  buurt?: string;
  gemeente?: string;
}

export interface LocatieState {
  readonly isLoading: boolean;
  readonly selectedAddress: string;
  readonly errorMessage: string;
  readonly canProceed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LocatieFacadeService {
  private readonly locatieService = inject(LocatieService);
  private readonly destroy$ = new Subject<void>();

  private readonly _isLoading = signal(false);
  private readonly _selectedAddress = signal('');
  private readonly _errorMessage = signal('');
  private _lastLocationInfo: LocatieInfo | null = null;

  readonly locatieState = computed<LocatieState>(() => ({
    isLoading: this._isLoading(),
    selectedAddress: this._selectedAddress(),
    errorMessage: this._errorMessage(),
    canProceed: !!this._selectedAddress()
  }));

  setupSearchControl(searchControl: FormControl): Observable<string> {
    return searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    );
  }

  async getCurrentLocation(): Promise<LocatieInfo> {
    this.startLoading();
    
    try {
      const position = await this.locatieService.getCurrentPosition();
      const { lat, lng } = position;
      
      const address = await this.locatieService.reverseGeocode(lat, lng);
      const locatieInfo = { latitude: lat, longitude: lng, address };

      return locatieInfo;
    } catch (error: any) {
      this.handleError(error.message || 'Fout bij ophalen van uw locatie');
      throw error;
    } finally {
      this.stopLoading();
    }
  }

  async searchAddress(query: string): Promise<LocatieInfo> {
    if (!this.locatieService.isValidQuery(query)) {
      throw new Error('Zoekterm is niet geldig');
    }

    this.startLoading();
    
    try {
      const { lat, lng } = await this.locatieService.getCoordinatesFromAddress(query);
      const locatieInfo = { latitude: lat, longitude: lng, address: query };

      return locatieInfo;
    } catch (error: any) {
      this.handleError(error.message || 'Fout bij zoeken naar adres');
      throw error;
    } finally {
      this.stopLoading();
    }
  }

  async selectMapLocation(locatieInfo: LocatieInfo): Promise<LocatieInfo> {
    if (!this.locatieService.isValidLocationInfo(locatieInfo)) {
      throw new Error('Locatie informatie is niet geldig');
    }

    try {
      const addressData = await this.locatieService.getDetailedAddressData(locatieInfo);
      const enrichedLocation = this.locatieService.enrichLocationWithAddressData(locatieInfo, addressData);

      return enrichedLocation;
    } catch (error: any) {
      this.handleError(error.message || 'Fout bij verwerken van locatie');
      throw error;
    }
  }

  getLastLocationInfo(): LocatieInfo | null {
    return this._lastLocationInfo;
  }

  clearError(): void {
    this._errorMessage.set('');
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  private startLoading(): void {
    this._isLoading.set(true);
  }

  private stopLoading(): void {
    this._isLoading.set(false);
  }

  private handleError(message: string): void {
    this._errorMessage.set(message);
  }
}