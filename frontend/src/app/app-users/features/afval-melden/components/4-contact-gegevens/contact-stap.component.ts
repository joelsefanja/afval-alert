import { Component, inject, signal, computed } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { NavigatieService } from '../../services/navigatie/navigatie.service';
import { MeldingConceptService } from '../../services/melding/concept/melding-concept.service';
import { ContactFormulierComponent } from './components/contact-formulier/contact-formulier.component';
import { NavigatieKnoppenComponent } from '../shared/navigatie-knoppen/navigatie-knoppen.component';

/**
 * Contact gegevens stap component
 * Gebruikt micro-components voor formulier en navigatie
 */
@Component({
  selector: 'app-contact-stap',
  standalone: true,
  imports: [
    ButtonModule, 
    CardModule,
    ToolbarModule,
    ContactFormulierComponent, 
    NavigatieKnoppenComponent
  ],
  templateUrl: './contact-stap.component.html',
})
export class ContactStapComponent {
  private readonly navigatie = inject(NavigatieService);
  private readonly conceptService = inject(MeldingConceptService);
 
  private readonly naam = signal('');
  private readonly email = signal('');
  
  readonly kanVolgende = computed(() => {
    const emailWaarde = this.email();
    if (!emailWaarde) return true; // Leeg email is geldig
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailWaarde);
  });
 
  onNaamGewijzigd(naam: string): void {
    this.naam.set(naam);
  }
 
  onEmailGewijzigd(email: string): void {
    this.email.set(email);
  }
 
  onVorige(): void {
    this.navigatie.vorige();
  }
 
  onOverslaan(): void {
    // Sla huidige waarden op (zelfs als leeg)
    const contactGegevens = {
      naam: this.naam(),
      email: this.email()
    };
    this.conceptService.plaatsContact(contactGegevens);
    this.navigatie.volgende();
  }
  
  onVolgende(): void {
    if (!this.kanVolgende()) return;
    
    const contactGegevens = {
      naam: this.naam(),
      email: this.email()
    };
    
    this.conceptService.plaatsContact(contactGegevens);
    this.navigatie.volgende();
  }
  
  krijgHuidigeNaam(): string {
    return this.naam();
  }
  
  krijgHuidigeEmail(): string {
    return this.email();
  }
}