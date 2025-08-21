import { Component, inject, input } from '@angular/core';
import { ProcesFlowService } from '@services/proces/navigatie';

/**
 * StapComponent - Basiscomponent voor alle stappen in de afvalmeld-procedure
 * 
 * Deze component vervangt de oude BaseStapComponent en biedt een consistente
 * interface voor alle stappen in de procedure.
 */
@Component({
  selector: 'app-stap',
  template: `
    <div class="max-w-md mx-auto px-4 py-6 space-y-6">
      @if (toonTerug()) {
        <button class="text-sm text-muted-foreground hover:text-foreground" (click)="vorige()">
          ← Terug
        </button>
      }
      <div>
        <h1 class="text-2xl font-bold">{{ titel() }}</h1>
        <div class="bg-muted/50 p-4 rounded-lg mt-4">
          <p class="text-sm text-muted-foreground">{{ subtitel() }}</p>
        </div>
      </div>
      <ng-content></ng-content>
    </div>
  `,
  standalone: true
})
export class StapComponent {
  protected readonly proces = inject(ProcesFlowService);
  
  // Inputs
  readonly titel = input.required<string>();
  readonly subtitel = input.required<string>();
  readonly toonTerug = input(true);
  
  /**
   * Navigeer naar de vorige stap
   */
  vorige(): void {
    this.proces.vorige();
  }

  /**
   * Navigeer naar de volgende stap
   */
  volgende(): void {
    this.proces.volgende();
  }
}