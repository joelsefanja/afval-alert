import { Injectable, inject } from '@angular/core';
import { MeldingsProcedureStatus } from '../melding/melding-state.service';
import { Locatie } from '@app/models';

/**
 * Service voor het beheren van locaties in de afvalmeldprocedure
 */
@Injectable({
  providedIn: 'root'
})
export class LocatieService {
  private afvalMeldProcedureState = inject(MeldingsProcedureStatus);
  
  /**
   * Verwerkt een geselecteerde locatie
   * @param locatie De geselecteerde locatie
   */
  verwerkLocatie(locatie: Locatie): void {
    const coordinaten = { lat: locatie.latitude, lng: locatie.longitude };
    const buitenGroningen = this.isLocatieInGroningen(coordinaten);
    this.afvalMeldProcedureState.setLocatie(locatie.adres || '', coordinaten);
  }
  
  /**
   * Controleert of een locatie binnen de gemeente Groningen ligt
   * @param coordinaten De coördinaten om te controleren
   * @returns Of de locatie buiten Groningen ligt
   */
  private isLocatieInGroningen(coordinaten: { lat: number; lng: number }): boolean {
    // Implementeer logica om te controleren of de locatie binnen Groningen ligt
    // Dit is een simpele simulatie
    const groningenCentrum = { lat: 53.2194, lng: 6.5665 };
    const maxAfstand = 0.1; // ~10km
    
    const afstand = Math.sqrt(
      Math.pow(coordinaten.lat - groningenCentrum.lat, 2) +
      Math.pow(coordinaten.lng - groningenCentrum.lng, 2)
    );
    
    return afstand > maxAfstand;
  }

  /**
   * Krijg de huidige locatie van de gebruiker
   * @returns Promise met de huidige locatie
   */
  async krijgHuidigeLocatie(): Promise<Locatie> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocatie wordt niet ondersteund door deze browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Controleer of locatie binnen Groningen ligt
          const coordinaten = { lat: latitude, lng: longitude };
          const buitenGroningen = this.isLocatieInGroningen(coordinaten);
          
          if (buitenGroningen) {
            this.afvalMeldProcedureState.setLocatie('', coordinaten);
            reject(new Error('Je bent buiten Groningen. Deze melding kunnen we helaas niet aannemen.'));
            return;
          }

          const locatie: Locatie = {
            latitude,
            longitude,
            adres: 'Huidige locatie'
          };

          // Stel locatie in state in
          this.afvalMeldProcedureState.setLocatie('Huidige locatie', coordinaten);
          resolve(locatie);
        },
        (error) => {
          let errorMessage = 'Kon je locatie niet vinden';
          switch (error.code) {
            case GeolocationPositionError.PERMISSION_DENIED:
              errorMessage = 'Locatie toegang geweigerd. Controleer je instellingen.';
              break;
            case GeolocationPositionError.POSITION_UNAVAILABLE:
              errorMessage = 'Locatie informatie niet beschikbaar.';
              break;
            case GeolocationPositionError.TIMEOUT:
              errorMessage = 'Locatie aanvraag duurde te lang.';
              break;
          }
          reject(new Error(errorMessage));
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  }
}