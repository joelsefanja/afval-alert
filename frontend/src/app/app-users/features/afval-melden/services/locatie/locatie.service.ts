import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { LocatieConfigService } from '@app/services/locatie-config.service';
import { MeldingsProcedureStatus } from '../melding/melding-state.service';


export interface AddressDetails {
  road?: string;
  house_number?: string;
  postcode?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state?: string;
  country?: string;
  neighbourhood?: string;
  quarter?: string;
  suburb?: string;
  [key: string]: any;
}

interface NominatimResponse {
  address: AddressDetails;
  lat: string;
  lon: string;
}

export interface FormattedAddress {
  straat: string;
  huisnummer: string;
  postcode: string;
  plaats: string;
  latitude?: number;
  longitude?: number;
  land: string;
  wijk?: string;
  buurt?: string;
  gemeente?: string;
  provincie?: string;
  rawAddress: AddressDetails;
}

@Injectable({
  providedIn: 'root'
})
export class LocatieService {
  private config: any;

  constructor(
    private http: HttpClient,
    @Inject(LocatieConfigService) private locatieConfigService: LocatieConfigService,
    private meldingState: MeldingsProcedureStatus
  ) {
    // Load the configuration
    this.locatieConfigService.loadConfig().subscribe((config: any) => {
      this.config = config;
    });
  }

  /**
   * Haal de huidige positie van de gebruiker op
   */
  getCurrentPosition(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        reject,
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }

  /**
   * Haal adresgegevens op op basis van coördinaten
   */
  async getAddressFromCoordinates(lat: number, lon: number): Promise<FormattedAddress> {
    if (!this.config) {
      return {
        straat: '',
        huisnummer: '',
        postcode: '',
        plaats: '',
        land: 'Nederland',
        latitude: 0,
        longitude: 0,
        wijk: '',
        buurt: '',
        gemeente: '',
        provincie: '',
        rawAddress: {} as AddressDetails
      };
    }

    const nominatimConfig = this.config.nominatim;
    const url = `${nominatimConfig.baseUrl}/reverse?format=${nominatimConfig.format}&lat=${lat}&lon=${lon}&zoom=${nominatimConfig.reverseZoom}&addressdetails=${nominatimConfig.addressdetails}`;

    return this.http.get<NominatimResponse>(url).pipe(
      map(response => {
        const address = response?.address ?? {};
        const formattedAddress: FormattedAddress = response ? {
          straat: address.road || '',
          latitude: parseFloat(response.lat),
          longitude: parseFloat(response.lon),
          huisnummer: address.house_number || '',
          postcode: address.postcode || '',
          plaats: address.city || address.town || address.village || '',
          land: address.country || 'Nederland',
          wijk: address.neighbourhood || address.quarter || address.suburb,
          buurt: address.neighbourhood,
          gemeente: address.city || address.municipality,
          provincie: address.state,
          rawAddress: address
        } : {
          straat: '',
          huisnummer: '',
          postcode: '',
          plaats: '',
          land: 'Nederland',
          latitude: 0,
          longitude: 0,
          wijk: '',
          buurt: '',
          gemeente: '',
          provincie: '',
          rawAddress: {} as AddressDetails
        };
        return formattedAddress;
      }),
      catchError(error => {
        console.error('Fout bij ophalen adresgegevens:', error);
        return of({
          straat: '',
          huisnummer: '',
          postcode: '',
          plaats: '',
          land: 'Nederland',
          latitude: 0,
          longitude: 0,
          wijk: '',
          buurt: '',
          gemeente: '',
          provincie: '',
          rawAddress: {} as AddressDetails
        });
      })
    ).toPromise() as Promise<FormattedAddress>;
  }

  /**
   * Haal coördinaten op op basis van een adres
   */
  async getCoordinatesFromAddress(address: string): Promise<{ lat: number; lng: number }> {
    if (!this.config) {
      throw new Error('Locatieconfiguratie niet geladen');
    }

    const nominatimConfig = this.config.nominatim;
    const url = `${nominatimConfig.baseUrl}/search?format=${nominatimConfig.format}&q=${encodeURIComponent(address)}&addressdetails=${nominatimConfig.addressdetails}`;

    return this.http.get<any[]>(url).pipe(
      map(results => {
        if (!results || results.length === 0) return { lat: 0, lng: 0 };

        const result = results[0];
        const lat = parseFloat(result?.lat);
        const lng = parseFloat(result?.lon);
        if (isNaN(lat) || isNaN(lng)) {
          return { lat: 0, lng: 0 };
        }
        return { lat: lat, lng: lng };
      }),
      catchError(error => {
        console.error('Fout bij ophalen coördinaten:', error);
        throw error;
      })
    ).toPromise() as Promise<{ lat: number; lng: number }>;
  }

  async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      return data.display_name || 'Onbekende locatie';
    } catch {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }

  async searchAddress(query: string): Promise<Array<{ address: string, lat: number, lng: number }>> {
    if (!query.trim()) return [];
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      return data.map((item: any) => ({
        address: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon)
      }));
    } catch {
      return [];
    }
  }

  /**
   * Valideer of een locatie binnen het toegestane gebied ligt
   */
  async valideerLocatie(lat: number, lng: number): Promise<boolean> {
    try {
      // Haal adresgegevens op om te valideren
      const addressData = await this.getAddressFromCoordinates(lat, lng);

      // Valideer op basis van configuratie
      return this.locatieConfigService.isToegestaanGebied(addressData?.latitude ?? 0, addressData?.longitude ?? 0);
    } catch (error: any) {
      console.error('Fout bij valideren locatie:', error);
      return false;
    }
  }

  isValidQuery(query: string): query is string {
    return typeof query === 'string' && query.trim().length > 3;
  }

  isValidLocationInfo(locatieInfo: any): boolean {
    return !!(locatieInfo &&
             typeof locatieInfo.latitude === 'number' &&
             typeof locatieInfo.longitude === 'number');
  }

  private async validateAndSaveLocation(locatieInfo: any): Promise<void> {
    const isValid = await this.valideerLocatie(
      locatieInfo.latitude,
      locatieInfo.longitude
    );

    if (!isValid) {
      throw new Error('Locatie valt buiten het toegestane gebied');
    }

    this.saveLocationInfo(locatieInfo);
  }

  private saveLocationInfo(locatieInfo: any): void {
    this.meldingState.setLocatie(locatieInfo.address, locatieInfo.latitude, locatieInfo.longitude);
  }

  async getDetailedAddressData(locatieInfo: any): Promise<FormattedAddress> {
    return this.getAddressFromCoordinates(
      locatieInfo.latitude,
      locatieInfo.longitude
    );
  }

  enrichLocationWithAddressData(locatieInfo: any, addressData: FormattedAddress): any {
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
}