import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

/**
 * Micro-component voor succes bericht
 * Toont bevestiging van verzonden melding
 */
@Component({
  selector: 'app-succes-bericht',
  standalone: true,
  imports: [ButtonModule, CardModule],
  templateUrl: './succes-bericht.component.html'
})
export class SuccesBerichtComponent {
  // Input signals
  readonly meldingId = input.required<string>();
  readonly kanPWAInstalleren = input(false);
  
  // Output signals
  readonly nieuweMelding = output<void>();
  readonly pwaInstalleren = output<void>();
  readonly sluitApplicatie = output<void>();
  
  onNieuweMelding(): void {
    this.nieuweMelding.emit();
  }
  
  onPWAInstalleren(): void {
    this.pwaInstalleren.emit();
  }
  
  onSluiten(): void {
    this.sluitApplicatie.emit();
  }
}