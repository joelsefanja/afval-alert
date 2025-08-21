import { Component, input, output, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

/**
 * Micro-component voor contact formulier
 * Handelt naam en email invoer af met validatie
 */
@Component({
  selector: 'app-contact-formulier',
  standalone: true,
  imports: [FormsModule, InputTextModule],
  templateUrl: './contact-formulier.component.html'
})
export class ContactFormulierComponent {
  // Input signals
  readonly initieleNaam = input('');
  readonly initieleEmail = input('');
  
  // Output signals
  readonly naamGewijzigd = output<string>();
  readonly emailGewijzigd = output<string>();
  
  // Local state
  readonly naam = signal('');
  readonly email = signal('');
  
  // Computed signals
  readonly isEmailGeldig = computed(() => {
    const emailWaarde = this.email();
    if (!emailWaarde) return true; // Leeg is geldig (optioneel)
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailWaarde);
  });
  
  readonly emailFoutmelding = computed(() => {
    if (this.isEmailGeldig()) return '';
    return 'Ongeldig e-mailadres';
  });
  
  constructor() {
    // Initialize with input values
    this.naam.set(this.initieleNaam());
    this.email.set(this.initieleEmail());
  }
  
  onNaamWijziging(nieuweNaam: string): void {
    this.naam.set(nieuweNaam);
    this.naamGewijzigd.emit(nieuweNaam);
  }
  
  onEmailWijziging(nieuweEmail: string): void {
    this.email.set(nieuweEmail);
    this.emailGewijzigd.emit(nieuweEmail);
  }
  
  resetFormulier(): void {
    this.naam.set('');
    this.email.set('');
  }
}