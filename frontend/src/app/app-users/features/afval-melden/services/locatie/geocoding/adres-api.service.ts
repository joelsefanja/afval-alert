import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LocatieConfigService } from '@app/services/locatie-config.service';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { FormattedAddress } from '@app/app-users/features/afval-melden/interfaces/locatie.interface';

// ===== Interfaces =====
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

// ===== Service =====
@Injectable({ providedIn: 'root' })
export class AdresApiService {
  private http = inject(HttpClient);
  private locatieConfig = inject(LocatieConfigService);
  private config: any;

  constructor() {
    // Laad configuratie bij aanmaak
    this.locatieConfig.loadConfig().subscribe(cfg => this.config = cfg);
  }

  // ===== Helper: GET request =====
  private get<T>(url: string): Observable<T> {
    return this.http.get<T>(url).pipe(
      catchError(err => {
        console.error('Geocoding API fout:', err);
        return throwError(() => new Error('Geocoding API fout'));
      })
    );
  }

  // ===== Helper: API URL bouwen =====
  private apiUrl(endpoint: string, params: string): string {
    if (!this.config) throw new Error('Geocoding config niet geladen');
    const base = this.config.nominatim.baseUrl;
    return `${base}/${endpoint}?${params}`;
  }

  // ===== Coördinaten ophalen =====
  getCoordinatenVanAdres(adres: string): Observable<{ lat: number; lng: number }> {
    const params = `format=json&q=${encodeURIComponent(adres)}&addressdetails=1`;
    return this.get<GeocodingApiResponse[]>(this.apiUrl('search', params)).pipe(
      map(res => {
        if (!res || res.length === 0) throw new Error('Geen coördinaten gevonden');
        const lat = parseFloat(res[0].lat);
        const lng = parseFloat(res[0].lon);
        if (isNaN(lat) || isNaN(lng)) throw new Error('Ongeldige coördinaten');
        return { lat, lng };
      })
    );
  }

  // ===== Meerdere adressen zoeken =====
  zoekAdres(query: string): Observable<Array<{ adres: string; lat: number; lng: number }>> {
    const params = `format=json&q=${encodeURIComponent(query)}&limit=5`;
    return this.get<GeocodingApiResponse[]>(this.apiUrl('search', params)).pipe(
      map(data => data.map(item => ({
        adres: item.display_name || '',
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon)
      })))
    );
  }

  // ===== Adres ophalen van coördinaten =====
  getAdresVanCoordinaten(lat: number, lon: number): Observable<FormattedAddress> {
    const params = `format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
    return this.get<GeocodingApiResponse>(this.apiUrl('reverse', params)).pipe(
      map(resp => {
        const adr = resp.address || {};
        return {
          street: adr.road || '',
          houseNumber: adr.house_number || '',
          postalCode: adr.postcode || '',
          city: adr.city || adr.town || adr.village || '',
          country: adr.country || 'Nederland',
          latitude: parseFloat(resp.lat),
          longitude: parseFloat(resp.lon),
          wijk: adr.neighbourhood || adr.quarter || adr.suburb || '',
          buurt: adr.neighbourhood || '',
          gemeente: adr.city || adr.municipality || '',
          provincie: adr.state || '',
          rawAddress: adr
        };
      })
    );
  }

  // ===== Reverse geocoding =====
  reverseGeocode(lat: number, lon: number): Observable<string> {
    const params = `format=json&lat=${lat}&lon=${lon}`;
    return this.get<GeocodingApiResponse>(this.apiUrl('reverse', params)).pipe(
      map(data => data?.display_name || 'Onbekende locatie'),
      catchError(() => throwError(() => new Error('Reverse geocoding fout')))
    );
  }
}

/**
 * Mogelijke refactor in meerdere services:
 * - AdresZoekerService: searchAdres, getCoordinatenVanAdres
 * - CoördinatenService: getAdresVanCoordinaten, reverseGeocode
 * - HttpService: helper get<T> en apiUrl
 */
