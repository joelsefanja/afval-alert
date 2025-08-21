import { Injectable, signal } from '@angular/core';
import * as leaflet from 'leaflet';

// Fix voor Leaflet iconen in Angular
delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
leaflet.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

@Injectable({
  providedIn: 'root'
})
export class KaartInitialisatieService {
  private readonly STANDAARD_LOCATIE = { latitude: 53.2193835, longitude: 6.5665017 } as const;
  // Using OpenStreetMap tiles with building data
  private readonly TEGEL_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  
  readonly isKaartKlaar = signal(false);

  initialiseerKaart(kaartElement: HTMLElement, onClickCallback: (event: leaflet.LeafletMouseEvent) => void): leaflet.Map {
    if (!kaartElement) {
      throw new Error('Kaart element is vereist');
    }

    // Create map with tilted view for 3D effect
    const kaart = leaflet.map(kaartElement, {
      zoomControl: false, // We'll add custom controls
      attributionControl: false,
      worldCopyJump: true,
      zoomSnap: 0.5,
      zoomDelta: 0.5
    }).setView(
      [this.STANDAARD_LOCATIE.latitude, this.STANDAARD_LOCATIE.longitude], 15
    );

    // Add tile layer
    leaflet.tileLayer(this.TEGEL_URL, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      minZoom: 3,
      detectRetina: true
    }).addTo(kaart);

    // Add custom zoom controls in top-right corner
    leaflet.control.zoom({
      position: 'topright'
    }).addTo(kaart);

    // Style the zoom controls
    setTimeout(() => {
      const zoomControls = kaartElement.querySelector('.leaflet-control-zoom');
      if (zoomControls) {
        (zoomControls as HTMLElement).style.borderRadius = '8px';
        (zoomControls as HTMLElement).style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        (zoomControls as HTMLElement).style.overflow = 'hidden';
        (zoomControls as HTMLElement).style.background = 'white';
        (zoomControls as HTMLElement).style.border = '1px solid rgba(0,0,0,0.1)';
      }
      
      const zoomIn = kaartElement.querySelector('.leaflet-control-zoom-in');
      const zoomOut = kaartElement.querySelector('.leaflet-control-zoom-out');
      
      if (zoomIn) {
        zoomIn.innerHTML = '+';
        (zoomIn as HTMLElement).style.fontWeight = 'bold';
        (zoomIn as HTMLElement).style.fontSize = '18px';
      }
      
      if (zoomOut) {
        zoomOut.innerHTML = '−'; // Using minus sign instead of hyphen
        (zoomOut as HTMLElement).style.fontWeight = 'bold';
        (zoomOut as HTMLElement).style.fontSize = '18px';
      }
    }, 100);

    // Add styled attribution
    const attribution = leaflet.control.attribution({
      position: 'bottomright',
      prefix: false
    });
    attribution.addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors');
    attribution.addTo(kaart);

    kaart.on('click', onClickCallback);
    this.isKaartKlaar.set(true);
    
    return kaart;
  }

  verwijderKaart(kaart: leaflet.Map | null): void {
    if (kaart) {
      kaart.remove();
    }
    this.isKaartKlaar.set(false);
  }

  getStandaardLocatie() {
    return this.STANDAARD_LOCATIE;
  }
}