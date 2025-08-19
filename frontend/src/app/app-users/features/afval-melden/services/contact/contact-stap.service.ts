import { Injectable, inject, signal, computed } from '@angular/core';
import { MeldingStateService } from '../melding';
import { StepBuilderService } from '../steps/step-builder.service';

export interface ContactData {
  naam?: string;
  email?: string;
  anoniem: boolean;
}

/**
 * ContactStapService - Service voor contact stap logica
 * 
 * Verantwoordelijkheden:
 * - Contactgegevens validatie
 * - Email format checking
 * - Anonieme melding handling
 * - Form state management
 * 
 * @example
 * ```typescript
 * constructor(private contactService: ContactStapService) {}
 * 
 * bevestigContact() {
 *   if (this.contactService.isValid()) {
 *     this.contactService.saveAndNext();
 *   }
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class ContactStapService {
  private meldingState = inject(MeldingStateService);
  private stepBuilder = inject(StepBuilderService);
  
  readonly naam = signal('');
  readonly email = signal('');
  readonly anoniem = signal(false);
  
  readonly isEmailValid = computed(() => {
    const emailValue = this.email().trim();
    return !emailValue || this.validateEmail(emailValue);
  });
  
  readonly isFormValid = computed(() => {
    if (this.anoniem()) return true;
    const emailValue = this.email().trim();
    return emailValue !== '' && this.isEmailValid();
  });

  setNaam(naam: string): void {
    this.naam.set(naam);
  }

  setEmail(email: string): void {
    this.email.set(email);
  }

  setAnoniem(anoniem: boolean): void {
    this.anoniem.set(anoniem);
    if (anoniem) {
      this.naam.set('');
      this.email.set('');
    }
  }

  saveAndNext(): void {
    if (!this.isFormValid()) return;
    
    this.meldingState.setContact(
      this.naam() || undefined,
      this.email() || undefined,
      this.anoniem()
    );
    this.stepBuilder.next();
  }

  prev(): void {
    this.stepBuilder.prev();
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }
}