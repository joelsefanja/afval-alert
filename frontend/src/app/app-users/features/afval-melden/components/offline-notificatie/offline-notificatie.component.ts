import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-offline-notificatie',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="fixed bottom-4 left-0 right-0 mx-auto w-11/12 max-w-md p-4 bg-amber-50 border border-amber-200 rounded-lg shadow-lg transition-all duration-300 motion-preset-slide-up"
      [class.opacity-0]="!isOffline()"
      [class.translate-y-20]="!isOffline()"
      [class.pointer-events-none]="!isOffline()"
    >
      <div class="flex items-center">
        <span class="material-icons text-amber-500 mr-3">wifi_off</span>
        <div>
          <p class="font-medium text-amber-800">U bent offline</p>
          <p class="text-sm text-amber-700">Uw melding wordt opgeslagen en verzonden zodra u weer online bent.</p>
        </div>
      </div>
    </div>
  `
})
export class OfflineNotificatieComponent {
  isOffline = input<boolean>(false);
}