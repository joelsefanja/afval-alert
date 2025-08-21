import { Injectable, inject } from '@angular/core';
import { LocatieConfigService } from '@app/services/locatie-config.service';
import { GeocodingService } from '../geocoding/geocoding.service';

@Injectable({
  providedIn: 'root'
})
export class LocatieValidatieService {
  private locatieConfig = inject(LocatieConfigService);
  private geocoding = inject(GeocodingService);

  async valideerLocatie(lat: number, lng: number): Promise<boolean> {
    try {
      const addressData = await this.geocoding.adresVanCoordinaten(lat, lng);
      if (!addressData) throw new Error('Geen adresdata gevonden voor validatie');
      return this.locatieConfig.isToegestaanGebied(lat, lng);
    } catch (error: any) {
      console.error('Fout bij valideren locatie:', error);
      return false;
    }
  }

  isValidLocationInfo(locatieInfo: any): boolean {
    return !!(locatieInfo &&
             typeof locatieInfo.latitude === 'number' &&
             typeof locatieInfo.longitude === 'number');
  }
}