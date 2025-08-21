import { Component, input, computed } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

/**
 * Micro-component voor melding overzicht
 * Toont samenvatting van ingevoerde gegevens
 */
@Component({
  selector: 'app-melding-overzicht',
  standalone: true,
  imports: [CardModule, TagModule],
  templateUrl: './melding-overzicht.component.html'
})
export class MeldingOverzichtComponent {
  // Input signals
  readonly concept = input.required<any>();
  readonly meldingId = input<string>('');
  
  // Computed signals
  readonly heeftLocatie = computed(() => !!this.concept().locatie);
  readonly heeftFoto = computed(() => !!this.concept().foto);
  readonly heeftContact = computed(() => {
    const contact = this.concept().contact;
    return !!(contact?.naam || contact?.email);
  });
  
  readonly volledigheid = computed(() => {
    let punten = 0;
    if (this.heeftLocatie()) punten++;
    if (this.heeftFoto()) punten++;
    if (this.heeftContact()) punten++;
    return Math.round((punten / 3) * 100);
  });
  
  readonly volledigheidsKleur = computed(() => {
    const percentage = this.volledigheid();
    if (percentage >= 75) return 'success';
    if (percentage >= 50) return 'warning';
    return 'danger';
  });
}