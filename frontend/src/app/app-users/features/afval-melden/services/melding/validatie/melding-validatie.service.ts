import { Injectable, computed, inject } from '@angular/core';
import { AfvalMeldingStateService } from '../state/afval-melding-state.service';
import { CameraService } from '../../camera.service';
import { LocatieService } from '../../locatie/locatie.service';

/**
 * Validatie service voor melding gegevens
 * Centralized validation logic
 */
@Injectable({ providedIn: 'root' })
export class MeldingValidatieService {
  private readonly meldingState = inject(AfvalMeldingStateService);
  private readonly camera = inject(CameraService);
  private readonly locatie = inject(LocatieService);
  
  // Validatie computed signals
  readonly heeftGeldigeFoto = computed(() => {
    // If the photo step was skipped, consider it valid
    if (this.meldingState.fotoStapOvergeslagen()) {
      return true;
    }
    // Otherwise, perform the actual photo validation
    return this.camera.fotoIsBeschikbaar;
  });
  
  readonly heeftGeldigeLocatie = computed(() => {
    // Get location from locatie service state
    const huidigeLocatie = this.locatie.currentLocation();
    return !!(huidigeLocatie?.latitude && huidigeLocatie?.longitude);
  });
  
  readonly heeftGeldigeContactgegevens = computed(() => {
    const melding = this.meldingState.afvalMeldingConcept();
    const contact = melding.contact;
    
    if (!contact) return false; // Geen contact opgegeven
    
    // Email validatie als opgegeven
    if (contact.email && !this.isValidEmail(contact.email)) return false;
    
    return true;
  });
  
  readonly kanVerzenden = computed(() => {
    return this.heeftGeldigeFoto() && 
           this.heeftGeldigeLocatie() && 
           this.heeftGeldigeContactgegevens();
  });
  
  readonly meldingVolledig = computed(() => {
    const melding = this.meldingState.afvalMeldingConcept();
    return !!(melding.conceptId && 
              melding.locatie && 
              melding.contact);
  });
  
  // Helper methods
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  // Public validation methods
  valideerEmail(email: string): { geldig: boolean; foutmelding?: string } {
    if (!email.trim()) {
      return { geldig: false, foutmelding: 'Email is verplicht' };
    }
    
    if (!this.isValidEmail(email)) {
      return { geldig: false, foutmelding: 'Ongeldig email adres' };
    }
    
    return { geldig: true };
  }
  
  valideerNaam(naam: string): { geldig: boolean; foutmelding?: string } {
    if (!naam.trim()) {
      return { geldig: false, foutmelding: 'Naam is verplicht' };
    }
    
    if (naam.length < 2) {
      return { geldig: false, foutmelding: 'Naam moet minimaal 2 karakters bevatten' };
    }
    
    return { geldig: true };
  }
  
  krijgValidatieStatus(): {
    foto: boolean;
    locatie: boolean; 
    contact: boolean;
    kanVerzenden: boolean;
  } {
    return {
      foto: this.heeftGeldigeFoto(),
      locatie: this.heeftGeldigeLocatie(),
      contact: this.heeftGeldigeContactgegevens(),
      kanVerzenden: this.kanVerzenden()
    };
  }
}