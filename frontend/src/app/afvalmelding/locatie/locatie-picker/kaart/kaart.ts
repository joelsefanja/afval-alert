import { Component, AfterViewInit } from '@angular/core';
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
    // Create a boundary based on the markers
    const bounds = L.latLngBounds(this.markers.map(marker => marker.getLatLng()));

    // Fit the map into the boundary
    this.map.fitBounds(bounds);
  }

  private setupMapClickHandler() {
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.addMarkerAtLocation(e.latlng);
    });
  }

  private addMarkerAtLocation(latlng: L.LatLng) {
    // Remove existing marker if it exists
    if (this.currentMarker) {
      this.map.removeLayer(this.currentMarker);
    }

    // Create new marker at clicked location
    this.currentMarker = L.marker(latlng).addTo(this.map);
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
}
