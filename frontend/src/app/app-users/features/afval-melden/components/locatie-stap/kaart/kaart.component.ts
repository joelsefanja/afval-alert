import { Component, input, output, inject, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { KaartControlService } from '../../../services/kaart/kaart-control.service';
import { LocatiePickerData } from '../../../services/locatie/locatie-picker.service';

@Component({
  selector: 'app-kaart',
  standalone: true,
  imports: [ButtonModule],
  template: `
    <div class="relative w-full h-96 border-round overflow-hidden">
      <div #map class="w-full h-full bg-gray-100"></div>
      
      <div class="absolute top-3 right-3 z-999">
        <p-button 
          icon="pi pi-times" 
          (onClick)="onClose()"
          size="small"
          severity="secondary"
          text
          rounded
          class="bg-white shadow-md">
        </p-button>
      </div>
      
      <div class="absolute bottom-3 left-3 right-3 z-999 text-center">
        <div class="bg-white p-2 border-round shadow-md text-xs text-600">
          Klik op de kaart om een locatie te selecteren
        </div>
      </div>
    </div>
  `
})
export class KaartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('map', { static: true }) mapContainer!: ElementRef;
  
  private kaartControl = inject(KaartControlService);
  
  selectedLocation = input<LocatiePickerData | null>(null);
  locationSelected = output<LocatiePickerData>();
  mapClosed = output<void>();

  ngAfterViewInit() {
    this.kaartControl.initializeMap(this.mapContainer.nativeElement);
    
    // Setup click handler
    this.kaartControl.onMapClick((lat: number, lng: number) => {
      this.locationSelected.emit({
        latitude: lat,
        longitude: lng,
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      });
    });
    
    const location = this.selectedLocation();
    if (location) {
      this.kaartControl.setMarker(location.latitude, location.longitude);
    }
  }

  ngOnDestroy() {
    this.kaartControl.destroyMap();
  }

  onClose() {
    this.mapClosed.emit();
  }
}