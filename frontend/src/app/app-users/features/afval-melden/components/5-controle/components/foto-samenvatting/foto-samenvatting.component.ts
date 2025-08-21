import { Component, input } from '@angular/core';
import { CardModule } from 'primeng/card';

/**
 * Micro-component voor foto samenvatting
 * Toont vastgelegde foto in controle stap
 */
@Component({
  selector: 'app-foto-samenvatting',
  standalone: true,
  imports: [CardModule],
  templateUrl: './foto-samenvatting.component.html'
})
export class FotoSamenvattingComponent {
  // Input signals
  readonly fotoUrl = input<string>('');
  readonly heeftFoto = input(false);
}