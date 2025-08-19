import { Injectable, inject, computed } from '@angular/core';
import { StepBuilderService } from '../index';
import { MeldingStateService } from '../melding/melding-state.service';
import { Contact, MeldingData } from '../../interfaces/melding.interface';

/**
 * NavigationService - Centralized navigation logic
 * 
 * Verantwoordelijkheden:
 * - Smart navigation between steps
 * - Step completion validation
 * - Navigation state management
 * - User flow optimization
 * 
 * @example
 * ```typescript
 * constructor(private nav: NavigationService) {}
 * 
 * goToNextStep() {
 *   if (this.nav.canProceed()) {
 *     this.nav.next();
 *   }
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class NavigationService {
  private stepBuilder = inject(StepBuilderService);
  private meldingState = inject(MeldingStateService);

  readonly currentStep = this.stepBuilder.activeIndex;
  readonly isFirst = this.stepBuilder.isFirst;
  readonly isLast = this.stepBuilder.isLast;

  readonly canProceedFromCurrentStep = computed(() => {
    const step = this.currentStep();
    const data = this.meldingState.meldingData();
    
    switch (step) {
      case 0: return true; // Start - always can proceed
      case 1: return !!data.foto; // Foto - needs photo
      case 2: return !!data.locatie; // Locatie - needs location
      case 3: return this.isContactValid(data.contact); // Contact - needs valid contact
      case 4: return this.isComplete(data); // Controle - needs everything
      default: return true;
    }
  });

  next() {
    if (this.canProceedFromCurrentStep()) {
      this.stepBuilder.next();
    }
  }

  prev() {
    this.stepBuilder.prev();
  }

  goto(index: number) {
    this.stepBuilder.goto(index);
  }

  reset() {
    this.stepBuilder.reset();
    this.meldingState.reset();
  }

  private isContactValid(contact?: Contact): boolean {
    if (!contact) return false;
    if (contact.anoniem) return true;
    return !!(contact.email && contact.email.includes('@'));
  }

  private isComplete(data: MeldingData): boolean {
    return !!(data.foto && data.locatie && data.contact && this.isContactValid(data.contact));
  }
}