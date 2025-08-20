import { Component, inject } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AFVAL_ALERT_TOKENS } from '@tokens/afval-alert.tokens';

@Component({
  selector: 'app-token-demo',
  standalone: true,
  imports: [CardModule, ButtonModule],
  template: `
    <div class="p-4 md:p-6">
      <h1 class="text-2xl font-bold mb-6 text-primary-800">Design Token Demo</h1>
      
      <!-- Color Tokens Demo -->
      <p-card header="Color Tokens" class="mb-6">
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div class="p-4 rounded-lg bg-primary-100 text-primary-800">Primary</div>
          <div class="p-4 rounded-lg bg-secondary-100 text-secondary-800">Secondary</div>
          <div class="p-4 rounded-lg bg-accent-100 text-accent-800">Accent</div>
          <div class="p-4 rounded-lg bg-success-100 text-success-800">Success</div>
          <div class="p-4 rounded-lg bg-warning-100 text-warning-800">Warning</div>
          <div class="p-4 rounded-lg bg-error-100 text-error-800">Error</div>
        </div>
      </p-card>
      
      <!-- Spacing Tokens Demo -->
      <p-card header="Spacing Tokens" class="mb-6">
        <div class="space-y-4">
          <div class="p-2 bg-surface-100 rounded">xs spacing</div>
          <div class="p-4 bg-surface-100 rounded">sm spacing</div>
          <div class="p-6 bg-surface-100 rounded">md spacing</div>
          <div class="p-8 bg-surface-100 rounded">lg spacing</div>
        </div>
      </p-card>
      
      <!-- Typography Tokens Demo -->
      <p-card header="Typography Tokens" class="mb-6">
        <div class="space-y-2">
          <p class="text-xs">Extra small text</p>
          <p class="text-sm">Small text</p>
          <p class="text-base">Base text</p>
          <p class="text-lg">Large text</p>
          <p class="text-xl">Extra large text</p>
          <p class="text-2xl">2X large text</p>
        </div>
      </p-card>
      
      <!-- Border Radius Demo -->
      <p-card header="Border Radius Tokens">
        <div class="flex flex-wrap gap-4">
          <div class="p-4 bg-surface-100 rounded">Default</div>
          <div class="p-4 bg-surface-100 rounded-lg">Large</div>
          <div class="p-4 bg-surface-100 rounded-xl">XL</div>
          <div class="p-4 bg-surface-100 rounded-full">Full</div>
        </div>
      </p-card>
    </div>
  `
})
export class TokenDemoComponent {
  protected tokens = inject(AFVAL_ALERT_TOKENS);
}