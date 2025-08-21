import { Injectable, signal, computed, inject } from '@angular/core';
import { ProcesStapValidatie } from '@interfaces/proces-stap-validatie.interface';
import { Locatie } from '@interfaces/locatie.interface';
import { ProcesNavigatorService } from '../navigatie/proces-navigator.service';
import { LocatieService } from '../../locatie/locatie.service';

@Injectable({ providedIn: 'root' })
export class LocatieStapService implements ProcesStapValidatie {
  private navigator = inject(ProcesNavigatorService);
  private locatieService = inject(LocatieService);
  
  readonly locatie = signal<{ breedtegraad: number; lengtegraad: number } | null>(null);
  readonly currentLocatie = signal<Locatie | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly isLoading = signal(false);
  readonly searchResults = signal<Locatie[]>([]);

  readonly isGeldigFormulier = computed(() => !!this.currentLocatie());

  isGeldig(): boolean { return this.isGeldigFormulier(); }

  opslaan(): void { 
    // Location is handled by the location service, not stored directly here
    // This service just validates the form
  }

  // Navigation methods
  nextStep(): void {
    this.navigator.volgende();
  }

  previousStep(): void {
    this.navigator.vorige();
  }

  canGoBack(): boolean {
    return true; // Always allow going back for now
  }

  // Location methods
  locatieSelecteren(location: Locatie): void {
    this.currentLocatie.set(location);
    this.errorMessage.set(null);
  }

  async searchAddress(query: string): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      const results = await this.locatieService.searchAddress(query);
      this.searchResults.set(results);
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Fout bij zoeken naar adres');
    } finally {
      this.isLoading.set(false);
    }
  }

  clearError(): void {
    this.errorMessage.set(null);
  }

  clearLocation(): void {
    this.currentLocatie.set(null);
    this.errorMessage.set(null);
  }
}
