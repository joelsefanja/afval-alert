import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Stap {
  id: number;
  titel: string;
  voltooid: boolean;
  actief: boolean;
}

/**
 * Header component die PrimeNG componenten gebruikt.
 * Deze component kan de originele header component vervangen.
 */
@Component({
  selector: 'ui-primeng-header',
  template: `
    <header class="bg-white dark:bg-surface-900 shadow-sm border-b border-surface-200 dark:border-surface-700 px-4 py-3">
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-semibold text-surface-900 dark:text-surface-100">{{ titel() }}</h1>
          <div class="flex items-center gap-3">
            @if (isOnline()) {
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-sm text-surface-600 dark:text-surface-400">Online</span>
              </div>
            } @else {
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-red-500 rounded-full"></div>
                <span class="text-sm text-surface-600 dark:text-surface-400">Offline</span>
              </div>
            }
          </div>
        </div>
        @if (stappen() && stappen()!.length > 0) {
          <div class="mt-4">
            <div class="flex items-center space-x-4">
              @for (stap of stappen(); track stap.id) {
                <div class="flex items-center">
                  <div class="flex items-center justify-center w-8 h-8 rounded-full"
                       [class]="stap.voltooid ? 'bg-green-100 text-green-600' : stap.actief ? 'bg-blue-100 text-blue-600' : 'bg-surface-100 text-surface-400'">
                    {{ stap.id }}
                  </div>
                  <span class="ml-2 text-sm font-medium"
                        [class]="stap.actief ? 'text-surface-900 dark:text-surface-100' : 'text-surface-500 dark:text-surface-400'">
                    {{ stap.titel }}
                  </span>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </header>
  `,
  standalone: true,
  imports: [CommonModule]
})
export class PrimengHeaderComponent {
  titel = input.required<string>();
  isOnline = input(true);
  stappen = input<Stap[]>();
}