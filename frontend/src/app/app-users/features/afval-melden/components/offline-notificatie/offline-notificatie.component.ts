import { Component, input } from '@angular/core';

@Component({
  selector: 'app-offline-notificatie',
  template: `
    @if (isOffline()) {
      <div class="fixed bottom-4 left-4 right-4 bg-orange-100 border border-orange-200 text-orange-800 p-4 rounded-lg">
        <p class="font-medium text-sm">Oeps, geen internet.</p>
        <p class="text-sm">Je melding ligt veilig op je telefoon en vliegt eruit zodra je weer verbinding hebt.</p>
      </div>
    }
  `,
  standalone: true
})
export class OfflineNotificatieComponent {
  isOffline = input<boolean>(false);
}