import { Component, inject, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToastModule } from 'primeng/toast';
import { MeldingsProcedureStatus } from '../../services/melding/melding-state.service';

/**
 * Component voor het optioneel invoeren van contactgegevens.
 * 
 * Deze component biedt de gebruiker de keuze tussen:
 * 1. Contactgegevens invullen voor updates over de melding
 * 2. Anonieme melding zonder contactgegevens
 * 
 * Features:
 * - Optioneel contact formulier met email validatie
 * - Anonieme melding optie
 * - Real-time form validatie
 * - Privacy informatie en GDPR compliance
 * - Responsive design
 * 
 * Validatie regels:
 * - Email is verplicht als niet anoniem
 * - Email moet geldig formaat hebben
 * - Naam is optioneel
 * 
 * @example
 * ```html
 * <app-contact-stap 
 *   [disabled]="false"
 *   (contactOpgeslagen)="onContactOpgeslagen($event)"
 *   (navigatieTerug)="onTerug()"
 *   (navigatieVolgende)="onVolgende()">
 * </app-contact-stap>
 * ```
 */
@Component({
  selector: 'app-contact-stap',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, CardModule, MessageModule, InputTextModule, CheckboxModule, RadioButtonModule, ToastModule],
  templateUrl: './contact-stap.component.html',
  styleUrls: ['./contact-stap.component.scss']
})
export class ContactStapComponent {
  // Dependency injection
  protected readonly state = inject(MeldingsProcedureStatus);

  // Input properties
  /** Schakelt de component uit wanneer true */
  readonly disabled = input<boolean>(false);

  // Output events
  /** Event dat wordt uitgezonden wanneer contactgegevens zijn opgeslagen */
  readonly contactOpgeslagen = output<{ email?: string, naam?: string }>();
  /** Event voor navigatie terug */
  readonly navigatieTerug = output<void>();
  /** Event voor navigatie naar volgende stap */
  readonly navigatieVolgende = output<void>();

  // Form state signals
  /** Email adres van de gebruiker */
  protected readonly email = signal<string>('');
  /** Naam van de gebruiker (optioneel) */
  protected readonly naam = signal<string>('');
  /** Geeft aan of gebruiker anonieme melding wil */
  protected readonly anoniem = signal<boolean>(false);

  // Computed properties
  /** Controleert of het formulier geldig is */
  protected readonly isFormulierGeldig = computed(() => {
    if (this.anoniem()) return true;

    const emailValue = this.email().trim();
    return emailValue !== '' && this.isGeldigEmail(emailValue);
  });

  /** Controleert of email geldig is */
  protected readonly isEmailGeldig = computed(() => {
    const emailValue = this.email().trim();
    return emailValue === '' || this.isGeldigEmail(emailValue);
  });

  /**
   * Navigeert terug naar de vorige stap
   */
  protected terug(): void {
    this.navigatieTerug.emit();
    this.state.gaTerugNaarVorige();
  }

  /**
   * Slaat contactgegevens op en navigeert naar volgende stap
   * - Voor anonieme meldingen: geen contactgegevens opslaan
   * - Voor reguliere meldingen: valideer en sla contactgegevens op
   */
  protected volgende(): void {
    if (!this.isFormulierGeldig() || this.disabled()) return;

    const contactGegevens = this.anoniem() ? {} : {
      email: this.email().trim(),
      naam: this.naam().trim() || undefined
    };

    this.state.setContactInfo(contactGegevens);
    this.contactOpgeslagen.emit(contactGegevens);
    this.navigatieVolgende.emit();
    this.state.gaNaarVolgende();
  }

  /**
   * Handler voor wijziging van anoniem checkbox
   * Wist alle contactgegevens wanneer anoniem wordt geselecteerd
   */
  protected onAniemChange(): void {
    if (this.anoniem()) {
      this.email.set('');
      this.naam.set('');
    }
  }

  /**
   * Update email waarde
   */
  protected updateEmail(value: string): void {
    this.email.set(value);
  }

  /**
   * Update naam waarde
   */
  protected updateNaam(value: string): void {
    this.naam.set(value);
  }


  /**
   * Update anoniem waarde
   */
  protected updateAnoniem(value: boolean): void {
    this.anoniem.set(value);
    if (value) {
      this.onAniemChange();
    }
  }

  /**
   * Valideert email adres formaat
   * Gebruikt RFC 5322 compliant regex voor email validatie
   * 
   * @param email Het te valideren email adres
   * @returns true als email geldig is, false anders
   */
  private isGeldigEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }
}