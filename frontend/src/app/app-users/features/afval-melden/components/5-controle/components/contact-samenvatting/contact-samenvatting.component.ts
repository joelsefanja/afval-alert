import { Component, input, computed } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

/**
 * Micro-component voor contact samenvatting
 * Toont ingevoerde contactgegevens in controle stap
 */
@Component({
  selector: 'app-contact-samenvatting',
  standalone: true,
  imports: [CardModule, TagModule],
  templateUrl: './contact-samenvatting.component.html'
})
export class ContactSamenvattingComponent {
  // Input signals
  readonly contact = input<any>(null);
  
  // Computed signals
  readonly heeftContactgegevens = computed(() => {
    const contactData = this.contact();
    return !!(contactData?.naam || contactData?.email);
  });
  
  readonly isAnoniem = computed(() => !this.heeftContactgegevens());
  
  readonly contactTekst = computed(() => {
    const contactData = this.contact();
    if (!contactData) return 'Anonieme melding';
    
    const delen = [];
    if (contactData.naam) delen.push(contactData.naam);
    if (contactData.email) delen.push(contactData.email);
    
    return delen.length > 0 ? delen.join(' - ') : 'Anonieme melding';
  });
}