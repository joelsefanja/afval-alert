import { Component, input, output, computed } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

/**
 * Micro-component voor het tonen van geselecteerde locatie
 * Toont adres, buurt en wijk in een kaartje
 */
@Component({
  selector: 'app-locatie-kaartje',
  standalone: true,
  imports: [CardModule, ButtonModule],
  templateUrl: './locatie-kaartje.component.html'
})
export class LocatieKaartjeComponent {
  // Input signals
  readonly locatie = input<any>(null);
  
  // Output signals
  readonly locatieGewist = output<void>();
  
  // Computed signals
  readonly buurtEnWijk = computed(() => {
    const loc = this.locatie();
    if (!loc) return '';
    
    const parts = [];
    if (loc.buurt) parts.push(loc.buurt);
    if (loc.wijk) parts.push(loc.wijk);
    
    return parts.join(', ');
  });
  
  onWissen(): void {
    this.locatieGewist.emit();
  }
}