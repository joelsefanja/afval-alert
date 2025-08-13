import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-step',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="step-container">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .step-container {
      display: flex;
      flex-direction: column;
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      padding: 1rem;
    }
  `]
})
export class StepComponent {
  stepId = input<string>('');
  isActive = signal<boolean>(false);
  
  // Methode om isActive te updaten (nodig omdat we geen directe setter meer hebben)
  setActive(active: boolean): void {
    this.isActive.set(active);
  }
}