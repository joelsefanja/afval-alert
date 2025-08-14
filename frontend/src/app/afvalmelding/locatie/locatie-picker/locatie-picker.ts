import { Component, output } from '@angular/core';
import { KaartComponent } from '../../../app-users/features/afval-melden/components/kaart/kaart.component';

@Component({
  selector: 'app-locatie-picker',
  template: `
    <div class="space-y-4">
      <div class="flex gap-2">
        <input type="text" placeholder="Zoek adres..." 
               class="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" />
        <button class="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 rounded-md text-sm" 
                (click)="getCurrentLocation()">
          📍 Huidige locatie
        </button>
      </div>
      
      <app-kaart>
        <div class="h-64 bg-muted rounded flex items-center justify-center">
          <p class="text-muted-foreground">Kaart wordt hier geladen</p>
        </div>
      </app-kaart>
    </div>
  `,
  standalone: true,
  imports: [KaartComponent]
})
export class LocatiePicker {
  locatieGeselecteerd = output<{latitude: number, longitude: number}>();

  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.locatieGeselecteerd.emit({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      });
    }
  }
}
