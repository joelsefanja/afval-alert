import { Injectable, inject } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { AdresApiService } from './adres-api.service';
import { FormattedAddress } from '@interfaces/locatie.interface';

/**
 * Service voor geocoding en reverse-geocoding.
 * Kan later opgesplitst worden:
 * - AdresZoekerService: searchAddress, getCoordinatesFromAddress
 * - LocatieResolverService: getAddressFromCoordinates, reverseGeocode
 */
@Injectable({ providedIn: 'root' })
export class GeocodingService {
  private adresApi = inject(AdresApiService);

  // ===== Adres van coördinaten =====
  async adresVanCoordinaten(lat: number, lon: number): Promise<FormattedAddress> {
    try {
      const resultaat = await lastValueFrom(this.adresApi.getAdresVanCoordinaten(lat, lon));
      if (!resultaat) throw new Error('Geen adres gevonden voor coördinaten');
      return resultaat;
    } catch (error) {
      console.error('Fout bij adresVanCoordinaten:', error);
      throw error;
    }
  }

  // ===== Coördinaten van adres =====
  async coordinatenVanAdres(adres: string): Promise<{ lat: number; lng: number }> {
    try {
      const resultaat = await lastValueFrom(this.adresApi.getCoordinatenVanAdres(adres));
      if (!resultaat) throw new Error('Geen coördinaten gevonden voor adres');
      return resultaat;
    } catch (error) {
      console.error('Fout bij coordinatenVanAdres:', error);
      throw error;
    }
  }

  // ===== Reverse geocoding =====
  async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const resultaat = await lastValueFrom(this.adresApi.reverseGeocode(lat, lng));
      if (!resultaat) throw new Error('Geen adres gevonden voor reverse geocoding');
      return resultaat;
    } catch (error) {
      console.error('Fout bij reverseGeocode:', error);
      throw error;
    }
  }

  // ===== Adres zoeken =====
  async zoekAdres(query: string): Promise<Array<{ adres: string; lat: number; lng: number }>> {
    try {
      const resultaat = await lastValueFrom(this.adresApi.zoekAdres(query));
      if (!resultaat) throw new Error('Geen zoekresultaten gevonden');
      return resultaat;
    } catch (error) {
      console.error('Fout bij zoekAdres:', error);
      throw error;
    }
  }

  // ===== Validatie query =====
  isValidQuery(query: string): query is string {
    return typeof query === 'string' && query.trim().length > 3;
  }
}
