import { Component, input, output, computed } from '@angular/core';
import { ButtonModule } from 'primeng/button';

/**
 * Micro-component voor foto voorvertoning
 * Toont vastgelegde foto met acties
 */
@Component({
  selector: 'app-foto-voorvertoning',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './foto-voorvertoning.component.html'
})
export class FotoVoorvertoningComponent {
  // Input signals
  readonly fotoUrl = input<string>('');
  readonly isBevestigen = input(false);
  readonly uploadStatus = input('Foto wordt verwerkt...');
  readonly toonInfo = input(true);
  
  // Output signals
  readonly fotoVerwijderd = output<void>();
  readonly fotoBevestigd = output<void>();
  
  onVerwijderen(): void {
    this.fotoVerwijderd.emit();
    
  }
  
  onBevestigen(): void {
    if (!this.isBevestigen()) {
      this.fotoBevestigd.emit();
    }
  }
}