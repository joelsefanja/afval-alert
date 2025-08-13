import { Injectable, inject } from '@angular/core';
import { MeldingState } from './melding-state.service';
import { Locatie } from '@app/models';

/**
 * Service voor het beheren van locaties in de afvalmeldprocedure
 */
@Injectable({
  providedIn: 'root'
})
export class LocatieService {
  private afvalMeldProcedureState = inject(MeldingState);
  
  /**
   * Verwerkt een geselecteerde locatie
   * @param locatie De geselecteerde locatie
   */
  verwerkLocatie(locatie: Locatie): void {
    const coordinaten = { lat: locatie.latitude, lng: locatie.longitude };
    const buitenGroningen = this.isLocatieInGroningen(coordinaten);
    this.afvalMeldProcedureState.setLocatie(locatie.adres || '', coordinaten, buitenGroningen);
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
}