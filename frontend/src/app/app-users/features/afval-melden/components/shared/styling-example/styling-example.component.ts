import { Component, inject } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AFVAL_ALERT_TOKENS, AfvalAlertTokens } from '@tokens/afval-alert.tokens';

@Component({
  selector: 'app-styling-example',
  standalone: true,
  imports: [CardModule, ButtonModule],
  template: `
    <div class="p-4 md:p-6 max-w-4xl mx-auto">
      <h1 class="text-2xl md:text-3xl font-bold mb-6 text-primary-800">Styling Guide Example</h1>
      
      <!-- Example of using PrimeNG components with Tailwind layout -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <p-card header="PrimeNG Component">
          <p class="mb-4 text-surface-700">
            This card is a PrimeNG component with Tailwind classes for spacing and text styling.
          </p>
          <div class="flex justify-end">
            <p-button 
              label="Action Button" 
              icon="pi pi-check"
              severity="primary" />
          </div>
        </p-card>
        
        <div class="bg-surface-0 p-6 rounded-lg shadow-md border border-surface-200">
          <h2 class="text-xl font-semibold mb-4 text-surface-900">Tailwind Styled Card</h2>
          <p class="mb-4 text-surface-700">
            This card is styled entirely with Tailwind classes, using the color tokens from our preset.
          </p>
          <div class="flex justify-end">
            <button 
              class="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md transition-colors"
              type="button">
              Tailwind Button
            </button>
          </div>
        </div>
      </div>
      
      <!-- Example of using the injected tokens -->
      <div class="bg-surface-0 p-6 rounded-lg shadow-md border border-surface-200">
        <h2 class="text-xl font-semibold mb-4 text-surface-900">Design Tokens Example</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="p-4 bg-primary-100 rounded-md">
            <p class="font-medium text-primary-800">Primary</p>
          </div>
          <div class="p-4 bg-secondary-100 rounded-md">
            <p class="font-medium text-secondary-800">Secondary</p>
          </div>
          <div class="p-4 bg-accent-100 rounded-md">
            <p class="font-medium text-accent-800">Accent</p>
          </div>
          <div class="p-4 bg-success-100 rounded-md">
            <p class="font-medium text-success-800">Success</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class StylingExampleComponent {
  // Inject the design tokens
  protected tokens = inject(AFVAL_ALERT_TOKENS);
  
  constructor() {
    // Log tokens to see them in action
    console.log('Afval Alert Tokens:', this.tokens);
  }
}