import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-kaart',
  template: `
    <div
      class="w-full rounded-lg overflow-hidden shadow-md bg-gray-100 flex items-center justify-center"
      [style.height]="hoogte()"
    >
      <div class="text-center space-y-2">
        <div class="text-4xl">🗺️</div>
        <p class="text-gray-500 text-sm">Kaart tijdelijk niet beschikbaar</p>
        @if (markerLat() && markerLng()) {
          <p class="text-xs text-gray-400">
            📍 {{ markerLat() | number:'1.4-4' }}, {{ markerLng() | number:'1.4-4' }}
          </p>
        }
      </div>
    </div>
  `,
  standalone: true,
  imports: [DecimalPipe]
})
export class KaartComponent {
  readonly hoogte = input<string>('300px');
  readonly centerLatitude = input<number>(53.2193835);
  readonly centerLongitude = input<number>(6.5665017);
  readonly zoomLevel = input<number>(13);
  readonly interactief = input<boolean>(true);
  readonly markerLat = input<number | undefined>(undefined);
  readonly markerLng = input<number | undefined>(undefined);
}