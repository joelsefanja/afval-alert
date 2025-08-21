import { Component, input, output, computed } from '@angular/core';
import { ButtonModule } from 'primeng/button';

/**
 * Gedeelde navigatie knoppen component
 * Herbruikbaar voor alle stappen met configureerbare labels
 */
@Component({
  selector: 'app-navigatie-knoppen',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './navigatie-knoppen.component.html'
})
export class NavigatieKnoppenComponent {
  // Input signals voor vorige knop
  readonly toonVorigeKnop = input(true);
  readonly vorigeLabel = input('Vorige');
  readonly vorigeUitgeschakeld = input(false);
  
  // Input signals voor volgende knop
  readonly toonVolgendeKnop = input(true);
  readonly volgendeLabel = input('Volgende');
  readonly volgendeIcon = input('pi pi-chevron-right');
  readonly volgendeIconPositie = input<'left' | 'right'>('right');
  readonly volgendeUitgeschakeld = input(false);
  readonly volgendeSeverity = input<'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger'>('primary');
  
  // Output signals
  readonly vorige = output<void>();
  readonly volgende = output<void>();
  
  // Computed signals
  readonly volgendeColumnClass = computed(() => {
    return this.toonVorigeKnop() ? 'col-6' : 'col-12';
  });
  
  onVorige(): void {
    if (!this.vorigeUitgeschakeld()) {
      this.vorige.emit();
    }
  }
  
  onVolgende(): void {
    if (!this.volgendeUitgeschakeld()) {
      this.volgende.emit();
    }
  }
}