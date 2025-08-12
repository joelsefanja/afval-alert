import { Component, AfterViewInit, Output, EventEmitter } from '@angular/core';
import * as L from 'leaflet';

const iconRetinaUrl = 'assets/leaflet/marker-icon-2x.png';
const iconUrl = 'assets/leaflet/marker-icon.png';
const shadowUrl = 'assets/leaflet/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-kaart',
  imports: [],
  templateUrl: './kaart.html',
  styleUrl: './kaart.scss'
})
export class Kaart implements AfterViewInit {
  @Output() addressSelected = new EventEmitter<string>();

  private map!: L.Map;
  private currentMarker?: L.Marker;

  markers: L.Marker[] = [
    L.marker([53.2193835, 6.5665017]), // Groningen
  ];

  ngAfterViewInit() {
    this.initMap();
    this.centerMap();
    this.setupMapClickHandler();
  }

  private initMap() {
    const baseMapURl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    this.map = L.map('map');
    L.tileLayer(baseMapURl).addTo(this.map);
  }

  private centerMap() {
    // Begrens de kaart op basis van de markers
    const bounds = L.latLngBounds(this.markers.map(marker => marker.getLatLng()));

    // Maak de markers zichtbaar op de kaart
    this.map.fitBounds(bounds);
  }

  private setupMapClickHandler() {
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.addMarkerAtLocation(e.latlng);
    });
  }

  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const latlng = L.latLng(lat, lng);

          this.addMarkerAtLocation(latlng);
          this.map.setView(latlng, 20);
        },
        (error) => {
          console.error('Error getting current location:', error);
          alert('Kon huidige locatie niet ophalen. Zorg ervoor dat locatievoorzieningen zijn ingeschakeld.');
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 6000
        }
      );
    } else {
      alert('Geolocatie wordt niet ondersteund door deze browser.');
    }
  }

  async searchAddress(address: string): Promise<void> {
    if (!address.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=nl`
      );
      const data = await response.json();

      if (data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        const latlng = L.latLng(lat, lon);

        this.addMarkerAtLocation(latlng);
        this.map.setView(latlng, 20);
        this.addressSelected.emit(result.display_name);
      } else {
        // Niet gevonden
      }
    } catch (error) {
      console.error('Fout bij het zoeken naar adres:', error);
    }
  }

  private async addMarkerAtLocation(latlng: L.LatLng) {
    // Verwijder bestaande marker als deze bestaat
    if (this.currentMarker) {
      this.map.removeLayer(this.currentMarker);
    }

    // Maak een nieuwe marker aan
    this.currentMarker = L.marker(latlng).addTo(this.map);

    // Reverse the latlng om het adres te vinden
    await this.reverseGeocode(latlng);
  }

  private async reverseGeocode(latlng: L.LatLng) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();

      if (data && data.display_name) {
        this.addressSelected.emit(data.display_name);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  }
}
