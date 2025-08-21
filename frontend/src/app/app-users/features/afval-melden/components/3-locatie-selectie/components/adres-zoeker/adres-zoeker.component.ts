import { Component, input, output, signal, computed, inject } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';

/**
 * Micro-component voor adres zoeken
 * Handelt zoeken en huidige locatie knop af
 */
@Component({
  selector: 'app-adres-zoeker',
  standalone: true,
  imports: [InputTextModule, ButtonModule, MessageModule, CardModule],
  templateUrl: './adres-zoeker.component.html'
})
export class AdresZoekerComponent {
  // Input signals
  readonly initieleZoekTekst = input('');
  readonly isZoekenBezig = input(false);
  readonly isHuidigeLocatieBezig = input(false);
  readonly foutmelding = input<string | null>(null);
  
  // Output signals
  readonly zoeken = output<string>();
  readonly huidigeLocatieOpvragen = output<void>();
  
  // Local state
  readonly zoekTekst = signal('');
  
  // Computed signals
  readonly kanZoeken = computed(() => this.zoekTekst().trim().length > 0);
  readonly huidigeLocatieIcon = computed(() => 
    this.isHuidigeLocatieBezig() ? 'pi pi-spin pi-spinner' : 'pi pi-crosshairs'
  );
  readonly huidigeLocatieLabel = computed(() => 
    this.isHuidigeLocatieBezig() ? 'Locatie zoeken...' : 'Huidige locatie'
  );
  
  constructor() {
    // Initialize with input value
    this.zoekTekst.set(this.initieleZoekTekst());
  }
  
  onZoekTekstWijziging(nieuweWaarde: string): void {
    this.zoekTekst.set(nieuweWaarde);
  }
  
  onZoeken(): void {
    if (this.kanZoeken()) {
      this.zoeken.emit(this.zoekTekst().trim());
    }
  }
  
  onHuidigeLocatie(): void {
    this.huidigeLocatieOpvragen.emit();
  }
  
  resetZoekTekst(): void {
    this.zoekTekst.set('');
  }
}