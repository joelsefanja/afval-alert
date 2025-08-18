import { Injectable, Inject } from '@angular/core';
import { GeocodingOpenstreetmapService } from './geocoding-openstreetmap.service';
import { LocatieConfigService } from '../../../../../services/locatie-config.service';

@Injectable({
  providedIn: 'root'
})
export class LocatieService {
  constructor(
    @Inject(GeocodingOpenstreetmapService) private geocodingService: GeocodingOpenstreetmapService,
    @Inject(LocatieConfigService) private locatieConfigService: LocatieConfigService
  ) {}

  /**
   * Haal de huidige positie van de gebruiker op
   */
  getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocatie wordt niet ondersteund door deze browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => resolve(position),
        error => {
          switch (error.code) {
            case GeolocationPositionError.PERMISSION_DENIED:
              reject(new Error('Toestemming voor locatiegegevens geweigerd'));
              break;
            case GeolocationPositionError.POSITION_UNAVAILABLE:
              reject(new Error('Locatiegegevens niet beschikbaar'));
              break;
            case GeolocationPositionError.TIMEOUT:
              reject(new Error('Time-out bij ophalen locatiegegevens'));
              break;
            default:
              reject(new Error('Onbekende fout bij ophalen locatiegegevens'));
              break;
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }

  /**
   * Haal adresgegevens op op basis van coördinaten
   */
  async getAddressFromCoordinates(lat: number, lon: number): Promise<string> {
    try {
      const addressData = await this.geocodingService.getAddressFromCoordinates(lat, lon).toPromise();
      
      // Combineer adrescomponenten tot een volledig adres
      const components = [];
      if (addressData?.straat) components.push(addressData.straat);
      if (addressData?.huisnummer) components.push(addressData.huisnummer);
      if (addressData?.postcode) components.push(addressData.postcode);
      if (addressData?.plaats) components.push(addressData.plaats);
      
      return components.join(' ');
    } catch (error) {
      console.error('Fout bij ophalen adres:', error);
      throw error;
    }
  }

  /**
   * Haal coördinaten op op basis van een adres
   */
  async getCoordinatesFromAddress(address: string): Promise<{ lat: number; lng: number }> {
    try {
      const result = await this.geocodingService.getCoordinatesFromAddress(address).toPromise();
      return { lat: result?.lat || 0, lng: result?.lng || 0 };
    } catch (error) {
      console.error('Fout bij ophalen coördinaten:', error);
      throw error;
    }
  }

  /**
   * Valideer of een locatie binnen het toegestane gebied ligt
   */
  async valideerLocatie(lat: number, lng: number): Promise<boolean> {
    try {
      // Haal adresgegevens op om te valideren
      const addressData = await this.geocodingService.getAddressFromCoordinates(lat, lng).toPromise();
      
      // Valideer op basis van configuratie
      return this.locatieConfigService.isToegestaanGebied(addressData?.rawAddress);
    } catch (error) {
      console.error('Fout bij valideren locatie:', error);
      return false;
    }
  }
}