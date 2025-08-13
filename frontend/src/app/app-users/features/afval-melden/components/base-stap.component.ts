import { Component, inject } from '@angular/core';
import { MeldingState } from '../services/melding-state.service';

/**
 * Base component voor alle stappen met gemeenschappelijke navigatie functionaliteit
 */
@Component({
  template: '',
  standalone: true
})
export abstract class BaseStapComponent {
  protected stateService = inject(MeldingState);
  
  // State voor navigatie
  heeftVorigeStap = this.stateService.heeftVorigeStap;
  
  /**
   * Ga naar de vorige stap
   */
  onTerug(): void {
    this.stateService.gaTerugNaarVorige();
  }
  
  /**
   * Ga naar de volgende stap
   */
  onVolgende(): void {
    this.stateService.gaNaarVolgende();
  }
}