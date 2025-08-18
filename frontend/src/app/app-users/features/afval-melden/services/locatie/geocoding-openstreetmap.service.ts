import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import * as L from 'leaflet';
import { LocatieConfigService } from '../../../../../services/locatie-config.service';

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

export interface NominatimResponse {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: AddressDetails;
  boundingbox: [string, string, string, string];
}

export interface FormattedAddress {
  straat: string;
  huisnummer: string;
  postcode: string;
  plaats: string;
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
export class GeocodingOpenstreetmapService {
  private config: any;

  constructor(
    private http: HttpClient,
    @Inject(LocatieConfigService) private locatieConfigService: LocatieConfigService
  ) {
    // Laad de configuratie
    this.locatieConfigService.loadConfig().subscribe((config: any) => {
      this.config = config;
    });
  }

  /**
   * Formatteer adresgegevens van OpenStreetMap
   */
  private formatAddress(data: NominatimResponse): FormattedAddress {
    const address = data.address || {};
    
    return {
      straat: address.road || '',
      huisnummer: address.house_number || '',
      postcode: address.postcode || '',
      plaats: address.city || address.town || address.village || '',
      land: address.country || 'Nederland',
      wijk: address.neighbourhood || address.quarter || address.suburb,
      buurt: address.neighbourhood,
      gemeente: address.city || address.municipality,
      provincie: address.state,
      rawAddress: address
    };
  }

  /**
   * Haal adresgegevens op op basis van coördinaten
   */
  getAddressFromCoordinates(lat: number, lon: number): Observable<FormattedAddress> {
    if (!this.config) {
      throw new Error('Locatieconfiguratie niet geladen');
    }

    const nominatimConfig = this.config.nominatim;
    const url = `${nominatimConfig.baseUrl}/reverse?format=${nominatimConfig.format}&lat=${lat}&lon=${lon}&zoom=${nominatimConfig.reverseZoom}&addressdetails=${nominatimConfig.addressdetails}`;

    return this.http.get<NominatimResponse>(url).pipe(
      map(response => {
        // Controleer of het adres in een toegestaan gebied ligt
        if (!this.locatieConfigService.isToegestaanGebied(response.address)) {
          throw new Error('Locatie valt buiten het toegestane gebied');
        }
        
        return this.formatAddress(response);
      }),
      catchError(error => {
        console.error('Fout bij ophalen adresgegevens:', error);
        throw error;
      })
    );
  }

  /**
   * Haal coördinaten op op basis van een adres
   */
  getCoordinatesFromAddress(address: string): Observable<{ lat: number; lng: number; display_name: string; address: FormattedAddress }> {
    if (!this.config) {
      throw new Error('Locatieconfiguratie niet geladen');
    }

    const nominatimConfig = this.config.nominatim;
    const url = `${nominatimConfig.baseUrl}/search?format=${nominatimConfig.format}&q=${encodeURIComponent(address)}&addressdetails=${nominatimConfig.addressdetails}`;

    return this.http.get<NominatimResponse[]>(url).pipe(
      map(results => {
        if (results.length === 0) {
          throw new Error('Adres niet gevonden');
        }

        const result = results[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        // Controleer of het adres in een toegestaan gebied ligt
        if (!this.locatieConfigService.isToegestaanGebied(result.address)) {
          throw new Error('Locatie valt buiten het toegestane gebied');
        }
        
        const formattedAddress = this.formatAddress(result);
        
        return {
          lat,
          lng,
          display_name: result.display_name,
          address: formattedAddress
        };
      }),
      catchError(error => {
        console.error('Fout bij ophalen coördinaten:', error);
        throw error;
      })
    );
  }
}