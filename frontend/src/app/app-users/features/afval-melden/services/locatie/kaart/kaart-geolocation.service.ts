import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class KaartGeolocationService {
  private readonly geolocatieOpties: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000
  };

  async getHuidigePositie(): Promise<GeolocationPosition> {
    if (!navigator.geolocation) {
      throw new Error('Geolocatie wordt niet ondersteund door deze browser');
    }
    
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, this.geolocatieOpties);
    });
  }

  mapGeolocationError(error: GeolocationPositionError): string {
    switch (error.code) {
      case GeolocationPositionError.PERMISSION_DENIED:
        return 'Toestemming voor locatiegegevens geweigerd. Controleer uw browserinstellingen.';
      case GeolocationPositionError.POSITION_UNAVAILABLE:
        return 'Locatiegegevens niet beschikbaar. Probeer het later opnieuw.';
      case GeolocationPositionError.TIMEOUT:
        return 'Time-out bij ophalen locatiegegevens. Probeer het opnieuw.';
      default:
        return 'Onbekende fout bij ophalen locatiegegevens.';
    }
  }
}