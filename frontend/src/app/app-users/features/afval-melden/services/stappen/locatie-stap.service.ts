import { Injectable, inject, signal, computed } from '@angular/core';
import { LocatieService } from '../locatie/locatie.service';
import { NavigatieService } from '../navigatie/navigatie.service';
import { MeldingConceptService } from '../melding/concept/melding-concept.service';
import { Locatie } from '../../interfaces/locatie.interface';

/**
 * Locatie stap service
 * Handles location step business logic
 */
@Injectable({ providedIn: 'root' })
export class LocatieStapService {
  private locatieService = inject(LocatieService);
  private navigatie = inject(NavigatieService);
  private conceptService = inject(MeldingConceptService);

  // State
  private _huidigeLocatie = signal<Locatie | null>(null);
  private _errorMessage = signal<string | null>(null);
  private _adresAanHetZoeken = signal(false);

  // Public readonly signals
  readonly huidigeLocatie = this._huidigeLocatie.asReadonly();
  readonly errorMessage = this._errorMessage.asReadonly();
  readonly adresAanHetZoeken = this._adresAanHetZoeken.asReadonly();

  readonly heeftLocatie = computed(() => this._huidigeLocatie() !== null);

  async zoekAdres(query: string): Promise<void> {
    if (!query.trim()) {
      this._errorMessage.set('Voer een adres in');
      return;
    }

    this._adresAanHetZoeken.set(true);
    this._errorMessage.set(null);

    try {
      const resultaten = await this.locatieService.zoekAdres(query);
      if (resultaten.length > 0) {
        this.selecteerLocatie(resultaten[0]);
      } else {
        this._errorMessage.set('Geen resultaten gevonden voor dit adres');
      }
    } catch (error) {
      this._errorMessage.set('Fout bij zoeken naar adres. Probeer opnieuw.');
    } finally {
      this._adresAanHetZoeken.set(false);
    }
  }

  selecteerLocatie(locatie: Locatie): void {
    this._huidigeLocatie.set(locatie);
    this._errorMessage.set(null);
    
    // Update the concept service
    this.conceptService.plaatsLocatie({
      breedtegraad: locatie.latitude,
      lengtegraad: locatie.longitude,
      adres: locatie.address
    });
    
    // Update the location service
    this.locatieService.setCurrentLocation(locatie);
  }

  verwijderLocation(): void {
    this._huidigeLocatie.set(null);
    this._errorMessage.set(null);
  }

  verwijderErrorMessage(): void {
    this._errorMessage.set(null);
  }

  volgende(): boolean {
    if (!this.heeftLocatie()) {
      this._errorMessage.set('Selecteer eerst een locatie');
      return false;
    }
    return this.navigatie.volgende();
  }

  vorige(): boolean {
    return this.navigatie.vorige();
  }
}