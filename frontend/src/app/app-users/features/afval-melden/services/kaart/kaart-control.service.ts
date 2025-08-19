import { Injectable, signal } from '@angular/core';
import * as L from 'leaflet';

export interface KaartMarker {
  latitude: number;
  longitude: number;
  address?: string;
}

// Fix voor Leaflet iconen in Angular
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/**
 * KaartControlService - Service voor kaart beheer
 * 
 * Verantwoordelijkheden:
 * - Leaflet kaart initialisatie
 * - Marker beheer (toevoegen/verwijderen)
 * - Kaart view control (zoom/pan)
 * - Click event handling
 * 
 * @example
 * ```typescript
 * constructor(private kaartControl: KaartControlService) {}
 * 
 * ngOnInit() {
 *   this.kaartControl.initializeMap(this.mapElement.nativeElement);
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class KaartControlService {
  private map: L.Map | null = null;
  private marker: L.Marker | null = null;
  
  readonly isMapReady = signal(false);
  readonly currentMarker = signal<KaartMarker | null>(null);
  
  private readonly DEFAULT_LOCATION = { lat: 53.2193835, lng: 6.5665017 }; // Groningen
  private readonly TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  initializeMap(mapElement: HTMLElement): void {
    if (!mapElement) {
      console.error('Map element required');
      return;
    }

    if (this.map) {
      this.map.remove();
    }

    this.map = L.map(mapElement).setView([this.DEFAULT_LOCATION.lat, this.DEFAULT_LOCATION.lng], 13);
    
    L.tileLayer(this.TILE_URL, {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.isMapReady.set(true);
  }

  setMarker(lat: number, lng: number, address?: string): void {
    if (!this.map) return;

    this.clearMarker();
    
    this.marker = L.marker([lat, lng]).addTo(this.map);
    this.map.setView([lat, lng], 16);
    
    if (address) {
      this.marker.bindPopup(address).openPopup();
    }
    
    this.currentMarker.set({ latitude: lat, longitude: lng, address });
  }

  clearMarker(): void {
    if (this.marker && this.map) {
      this.map.removeLayer(this.marker);
      this.marker = null;
    }
    this.currentMarker.set(null);
  }

  onMapClick(callback: (lat: number, lng: number) => void): void {
    if (!this.map) return;
    
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      callback(e.latlng.lat, e.latlng.lng);
    });
  }

  destroyMap(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.marker = null;
    }
    this.isMapReady.set(false);
    this.currentMarker.set(null);
  }
}