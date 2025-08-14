import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import * as L from 'leaflet';
import { Observable, catchError, lastValueFrom, map, of } from 'rxjs';

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

interface NominatimReverseResponse {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  class: string;
  type: string;
  place_rank: number;
  importance: number;
  addresstype: string;
  name?: string;
  display_name: string;
  address: {
    amenity?: string;
    road?: string;
    neighbourhood?: string;
    quarter?: string;
    suburb?: string;
    city?: string;
    municipality?: string;
    state?: string;
    "ISO3166-2-lvl4"?: string;
    country: string;
    postcode?: string;
    country_code: string;
  };
  boundingbox: [string, string, string, string];
}

interface NominatimSearchResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  class: string;
  type: string;
  place_rank: number;
  importance: number;
  addresstype: string;
  name?: string;
  display_name: string;
  boundingbox: [string, string, string, string];
}

@Injectable({
  providedIn: 'root'
})
export class KaartService {
  private map!: L.Map;
  private currentMarker?: L.Marker;
  addressSelected = new EventEmitter<string>();

  private readonly defaultLocation = { lat: 53.2193835, lng: 6.5665017 } as const; // Groningen
  private readonly mapConfig = {
    baseMapUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    defaultZoom: 20,
    reverseGeocodeZoom: 18
  } as const;

  private readonly geolocationOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 6000
  };

  private readonly NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
  private readonly NOMINATIM_REVERSE_URL = `${this.NOMINATIM_BASE_URL}/reverse?format=json&zoom=18&addressdetails=1`;
  private readonly NOMINATIM_SEARCH_URL = `${this.NOMINATIM_BASE_URL}/search?format=json&limit=1`;

  constructor(private http: HttpClient) {}

  initMap(containerId: string) {
    this.map = L.map(containerId);
    L.tileLayer(this.mapConfig.baseMapUrl).addTo(this.map);

    this.centerMap();
    this.initMapClickHandler();
  }

  private centerMap() {
    // Begrens de kaart op basis van de defaultLocation
    const bounds = L.latLngBounds([this.defaultLocation]);

    // Maak de markers zichtbaar op de kaart
    this.map.fitBounds(bounds);
  }

  private initMapClickHandler() {
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.addMarkerAtLocation(e.latlng);
    });
  }

  async getCurrentLocation() {
    if (!navigator.geolocation) {
      console.error('Geolocatie wordt niet ondersteund door deze browser.')
      return;
    }

    try {
      const position = await this.getPosition();
      const latlng = L.latLng(position.coords.latitude, position.coords.longitude);

      await this.addMarkerAtLocation(latlng);
      this.map.setView(latlng, this.mapConfig.reverseGeocodeZoom);
    } catch (error) {
      console.error('Fout bij ophalen huidige locatie', error);
      alert('Kan huidige locatie niet ophalen. Zorg ervoor dat locatievoorzieningen zijn ingeschakeld.')
    }
  }

  private getPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, this.geolocationOptions);
    });
  }

  private async addMarkerAtLocation(latlng: L.LatLng) {
    this.removeCurrentMarker();
    this.currentMarker = L.marker(latlng).addTo(this.map);
    this.reverseGeocode(latlng).subscribe(address => {
      if (address) {
        this.addressSelected.emit(address);
      }
    });
  }

  private removeCurrentMarker(): void {
    // Check of er een huidige marker is
    if (this.currentMarker) {
      this.map.removeLayer(this.currentMarker);
      this.currentMarker = undefined;
    }
  }

  private reverseGeocode(latlng: L.LatLng): Observable<string | null> {
    const url = this.buildReverseGeocodeUrl(latlng);

    return this.http.get<NominatimReverseResponse>(url).pipe(
      map(data => data?.display_name ?? null),
      catchError(error => {
        console.error('Error reverse geocoding:', error);
        return of(null);
      })
    );
  }

  async searchAddress(address: string): Promise<void> {
    const url = this.buildSearchUrl(address);

    try {
      const results = await lastValueFrom(
        this.http.get<NominatimSearchResult[]>(url).pipe(
          catchError(error => {
            console.error('Error searching address:', error);
            return of([]);
          })
        )
      );

      if (results && results.length > 0) {
        const result = results[0];
        const latlng = L.latLng(parseFloat(result.lat), parseFloat(result.lon));
        await this.addMarkerAtLocation(latlng);
        this.map.setView(latlng, this.mapConfig.defaultZoom);
        this.addressSelected.emit(result.display_name);
      } else {
        alert('Geen adres gevonden.');
      }
    } catch (error) {
      console.error('Fout bij adres zoeken:', error);
    }
  }

  private buildReverseGeocodeUrl(latlng: L.LatLng): string {
    return `${this.NOMINATIM_REVERSE_URL}&lat=${latlng.lat}&lon=${latlng.lng}`;
  }

  private buildSearchUrl(address: string): string {
    return `${this.NOMINATIM_SEARCH_URL}&q=${encodeURIComponent(address)}`;
  }
}
