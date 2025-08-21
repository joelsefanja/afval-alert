import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LocatieConfigService } from '@app/services/locatie-config.service';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { FormattedAddress } from '@app/app-users/features/afval-melden/interfaces/locatie.interface';

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

interface GeocodingApiResponse {
  address: AddressDetails;
  lat: string;
  lon: string;
  display_name?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdresApiService {
  private http = inject(HttpClient);
  private locatieConfigService = inject(LocatieConfigService);
  private config: any;

  constructor() {
    this.locatieConfigService.loadConfig().subscribe(config => {
      this.config = config;
    });
  }

  private get<T>(url: string): Observable<T> {
    return this.http.get<T>(url).pipe(
      catchError(error => {
        console.error('Geocoding API error:', error);
        return throwError(() => new Error('Geocoding API error')); // Throw an error instead of returning null
      })
    );
  }

  private getApiUrl(endpoint: string, params: string): string {
    if (!this.config) {
      throw new Error('Geocoding config not loaded');
    }
    const nominatimConfig = this.config.nominatim; // Still uses nominatim config for base URL
    return `${nominatimConfig.baseUrl}/${endpoint}?${params}`;
  }

  getCoordinatesFromAddress(address: string): Observable<{ lat: number; lng: number }> {
    const params = `format=json&q=${encodeURIComponent(address)}&addressdetails=1`;
    const url = this.getApiUrl('search', params);

    return this.get<GeocodingApiResponse[]>(url).pipe(
      map(results => {
        if (!results || results.length === 0) throw new Error('No coordinates found'); // Throw error if no results
        const result = results[0];
        const lat = parseFloat(result?.lat);
        const lng = parseFloat(result?.lon);
        if (isNaN(lat) || isNaN(lng)) throw new Error('Invalid coordinates');
        return { lat, lng };
      })
    );
  }

  searchAddress(query: string): Observable<Array<{ address: string, lat: number, lng: number }>> {
    const params = `format=json&q=${encodeURIComponent(query)}&limit=5`;
    const url = this.getApiUrl('search', params);

    return this.get<GeocodingApiResponse[]>(url).pipe(
      map(data => data ? data.map((item: GeocodingApiResponse) => ({
        address: item.display_name || '',
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon)
      })) : [])
    );
  }

  getAddressFromCoordinates(lat: number, lon: number): Observable<FormattedAddress> {
    const params = `format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
    const url = this.getApiUrl('reverse', params);

    return this.get<GeocodingApiResponse>(url).pipe(
      map(response => {
        const address = response?.address ?? {};
        return {
          street: address.road || '',
          houseNumber: address.house_number || '',
          postalCode: address.postcode || '',
          city: address.city || address.town || address.village || '',
          country: address.country || 'Nederland',
          latitude: parseFloat(response.lat),
          longitude: parseFloat(response.lon),
          wijk: address.neighbourhood || address.quarter || address.suburb || '',
          buurt: address.neighbourhood || '',
          gemeente: address.city || address.municipality || '',
          provincie: address.state || '',
          rawAddress: address
        };
      })
    );
  }

  reverseGeocode(lat: number, lng: number): Observable<string> {
    const params = `format=json&lat=${lat}&lon=${lng}`;
    const url = this.getApiUrl('reverse', params);

    return this.get<GeocodingApiResponse>(url).pipe(
      map(data => data?.display_name || 'Onbekende locatie'),
      catchError(() => throwError(() => new Error('Reverse geocoding error')))
    );
  }
}