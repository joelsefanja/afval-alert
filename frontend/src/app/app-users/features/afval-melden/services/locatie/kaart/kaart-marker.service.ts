import { Injectable, signal, EventEmitter } from '@angular/core';
import * as leaflet from 'leaflet';

// Create custom 3D Mapbox-like marker icon with gradient
const customMarkerIcon = leaflet.divIcon({
  className: 'custom-marker',
  html: `
    <div style="
      position: relative;
      width: 36px;
      height: 36px;
      filter: drop-shadow(0 3px 6px rgba(0,0,0,0.2));
    ">
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="markerGradient" cx="50%" cy="40%" r="50%" fx="50%" fy="40%">
            <stop offset="0%" stop-color="#10b981" stop-opacity="1"/>
            <stop offset="100%" stop-color="#059669" stop-opacity="1"/>
          </radialGradient>
          <filter id="markerShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000000" flood-opacity="0.3"/>
          </filter>
        </defs>
        <path 
          d="M18 2C18 2 8 9.5 8 18C8 24.6274 12.912 30 18 30C23.088 30 28 24.6274 28 18C28 9.5 18 2 18 2Z" 
          fill="url(#markerGradient)" 
          filter="url(#markerShadow)"
          stroke="white" 
          stroke-width="2"/>
        <circle cx="18" cy="18" r="6" fill="white" stroke="#059669" stroke-width="1"/>
        <circle cx="18" cy="18" r="3" fill="#059669"/>
      </svg>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36]
});

export interface KaartMarker {
  latitude: number;
  longitude: number;
  address?: string;
}

@Injectable({
  providedIn: 'root'
})
export class KaartMarkerService {
  readonly huidigeMarker = signal<KaartMarker | null>(null);
  
  adresGeselecteerd = new EventEmitter<string>();
  locatieGeselecteerd = new EventEmitter<{latitude: number, longitude: number, address: string}>();

  setMarker(kaart: leaflet.Map, latitude: number, longitude: number, address?: string): leaflet.Marker {
    const marker = leaflet.marker([latitude, longitude], {
      icon: customMarkerIcon
    }).addTo(kaart);
    
    kaart.setView([latitude, longitude], 16, {
      animate: true,
      duration: 1.0
    });
    
    if (address) {
      // Create custom styled popup with 3D effects
      marker.bindPopup(`
        <div style="
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 14px;
          line-height: 1.4;
          padding: 10px 14px;
          border-radius: 12px;
          box-shadow: 
            0 10px 25px rgba(0,0,0,0.2),
            0 5px 10px rgba(0,0,0,0.15);
          background: linear-gradient(to bottom, #ffffff, #fafafa);
          color: #333;
          max-width: 220px;
          border: 1px solid rgba(0,0,0,0.05);
        ">
          <div style="
            font-weight: 500;
            margin-bottom: 2px;
            color: #059669;
          ">Geselecteerde locatie</div>
          <div style="
            font-weight: 400;
          ">${address}</div>
        </div>
      `, {
        className: 'custom-popup',
        offset: [0, -18]
      }).openPopup();
    }
    
    this.huidigeMarker.set({ latitude, longitude, address });
    return marker;
  }

  verwijderMarker(kaart: leaflet.Map, marker: leaflet.Marker | null): void {
    if (marker && kaart) {
      kaart.removeLayer(marker);
    }
    this.huidigeMarker.set(null);
  }

  getHuidigeMarker(): KaartMarker | null {
    return this.huidigeMarker();
  }

  emitLocatieEvents(latitude: number, longitude: number, address: string): void {
    this.adresGeselecteerd.emit(address);
    this.locatieGeselecteerd.emit({ latitude, longitude, address });
  }
}