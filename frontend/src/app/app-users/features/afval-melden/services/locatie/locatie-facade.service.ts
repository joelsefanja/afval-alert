import { Injectable, inject, signal, computed } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, takeUntil, Observable } from 'rxjs';
import { LocatieService } from './locatie.service';
import { GeocodingOpenstreetmapService } from './geocoding-openstreetmap.service';
import { MeldingsProcedureStatus } from '../melding/melding-state.service';

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
  private readonly geocodingService = inject(GeocodingOpenstreetmapService);
  private readonly state = inject(MeldingsProcedureStatus);
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
      const { latitude, longitude } = position.coords;
      
      const address = await this.locatieService.getAddressFromCoordinates(latitude, longitude);
      const locatieInfo = { latitude, longitude, address };
      
      await this.validateAndSaveLocation(locatieInfo);
      return locatieInfo;
    } catch (error: any) {
      this.handleError(error.message || 'Fout bij ophalen van uw locatie');
      throw error;
    } finally {
      this.stopLoading();
    }
  }

  async searchAddress(query: string): Promise<LocatieInfo> {
    if (!this.isValidQuery(query)) {
      throw new Error('Zoekterm is niet geldig');
    }

    this.startLoading();
    
    try {
      const { lat, lng } = await this.locatieService.getCoordinatesFromAddress(query);
      const locatieInfo = { latitude: lat, longitude: lng, address: query };
      
      await this.validateAndSaveLocation(locatieInfo);
      return locatieInfo;
    } catch (error: any) {
      this.handleError(error.message || 'Fout bij zoeken naar adres');
      throw error;
    } finally {
      this.stopLoading();
    }
  }

  async selectMapLocation(locatieInfo: LocatieInfo): Promise<LocatieInfo> {
    if (!this.isValidLocationInfo(locatieInfo)) {
      throw new Error('Locatie informatie is niet geldig');
    }

    try {
      const addressData = await this.getDetailedAddressData(locatieInfo);
      const enrichedLocation = this.enrichLocationWithAddressData(locatieInfo, addressData);
      
      await this.validateAndSaveLocation(enrichedLocation);
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

  private async validateAndSaveLocation(locatieInfo: LocatieInfo): Promise<void> {
    const isValid = await this.locatieService.valideerLocatie(
      locatieInfo.latitude, 
      locatieInfo.longitude
    );
    
    if (!isValid) {
      throw new Error('Locatie valt buiten het toegestane gebied');
    }
    
    this.saveLocationInfo(locatieInfo);
  }

  private saveLocationInfo(locatieInfo: LocatieInfo): void {
    this._lastLocationInfo = locatieInfo;
    this._selectedAddress.set(locatieInfo.address);
    this.clearError();
  }

  private async getDetailedAddressData(locatieInfo: LocatieInfo): Promise<any> {
    return this.geocodingService.getAddressFromCoordinates(
      locatieInfo.latitude, 
      locatieInfo.longitude
    ).toPromise();
  }

  private enrichLocationWithAddressData(locatieInfo: LocatieInfo, addressData: any): LocatieInfo {
    return {
      ...locatieInfo,
      address: this.formatDetailedAddress(addressData, locatieInfo.address),
      wijk: addressData?.wijk,
      buurt: addressData?.buurt,
      gemeente: addressData?.gemeente
    };
  }

  private formatDetailedAddress(addressData: any, fallback: string): string {
    if (!addressData) return fallback;
    
    return `${addressData.straat} ${addressData.huisnummer}, ${addressData.postcode} ${addressData.plaats}`;
  }

  private isValidQuery(query: string): query is string {
    return typeof query === 'string' && query.trim().length > 3;
  }

  private isValidLocationInfo(locatieInfo: LocatieInfo): boolean {
    return !!(locatieInfo && 
             typeof locatieInfo.latitude === 'number' && 
             typeof locatieInfo.longitude === 'number');
  }

  private startLoading(): void {
    this._isLoading.set(true);
    this.clearError();
  }

  private stopLoading(): void {
    this._isLoading.set(false);
  }

  private handleError(message: string): void {
    this._errorMessage.set(message);
  }
}