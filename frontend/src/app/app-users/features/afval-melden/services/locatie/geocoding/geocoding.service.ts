import { Injectable, inject } from '@angular/core';
import { AdresApiService } from './adres-api.service';
import { FormattedAddress } from '@interfaces/locatie.interface';

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  private adresApi = inject(AdresApiService);

  async getAddressFromCoordinates(lat: number, lon: number): Promise<FormattedAddress> {
    try {
      const result = await this.adresApi.getAddressFromCoordinates(lat, lon).toPromise();
      if (!result) throw new Error('Geen adres gevonden voor coördinaten');
      return result;
    } catch (error) {
      console.error('Error in getAddressFromCoordinates:', error);
      throw error;
    }
  }

  async getCoordinatesFromAddress(address: string): Promise<{ lat: number; lng: number }> {
    try {
      const result = await this.adresApi.getCoordinatesFromAddress(address).toPromise();
      if (!result) throw new Error('Geen coördinaten gevonden voor adres');
      return result;
    } catch (error) {
      console.error('Error in getCoordinatesFromAddress:', error);
      throw error;
    }
  }

  async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const result = await this.adresApi.reverseGeocode(lat, lng).toPromise();
      if (!result) throw new Error('Geen adres gevonden voor reverse geocoding');
      return result;
    } catch (error) {
      console.error('Error in reverseGeocode:', error);
      throw error;
    }
  }

  async searchAddress(query: string): Promise<Array<{ address: string, lat: number, lng: number }>> {
    try {
      const result = await this.adresApi.searchAddress(query).toPromise();
      if (!result) throw new Error('Geen zoekresultaten gevonden');
      return result;
    } catch (error) {
      console.error('Error in searchAddress:', error);
      throw error;
    }
  }

  isValidQuery(query: string): query is string {
    return typeof query === 'string' && query.trim().length > 3;
  }
}