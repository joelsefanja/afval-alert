import { Injectable, EventEmitter, Inject } from '@angular/core';
import * as L from 'leaflet';
import { LocatieConfigService } from '@app/services/locatie-config.service';

// Fix voor Leaflet iconen in Angular
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

@Injectable({
  providedIn: 'root'
})
export class KaartService {
  private map: L.Map | null = null;
  private marker: L.Marker | null = null;
  private config: any;

  addressSelected = new EventEmitter<string>();
  locationSelected = new EventEmitter<{latitude: number, longitude: number, address: string}>();

  // Default locatie is Groningen
  private readonly defaultLocation = { lat: 53.2193835, lng: 6.5665017 } as const;

  private readonly geolocationOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000
  };

  private readonly TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  private readonly TILE_CONFIG = {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  };

  constructor(@Inject(LocatieConfigService) private locatieConfigService: LocatieConfigService) {
    // Laad de configuratie
    this.locatieConfigService.loadConfig().subscribe((config: any) => {
      this.config = config;
      console.log('KaartService: config loaded', this.config);
    });
  }

  /**
   * Initialiseer de kaart
   */
  initializeMap(mapElement: HTMLElement): void {
    if (!mapElement) {
      console.error('Map element is vereist');
      return;
    }

    // Verwijder bestaande kaart als die er is
    if (this.map) {
      this.map.remove();
    }

    // Maak nieuwe kaart
    this.map = L.map(mapElement).setView(
      [this.defaultLocation.lat, this.defaultLocation.lng], 
      13
    );

    // Voeg tegels toe
    L.tileLayer(this.TILE_URL, this.TILE_CONFIG).addTo(this.map);

    // Voeg klik event toe
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.addMarkerAtLocation(e.latlng);
    });
  }

  /**
   * Haal de huidige locatie van de gebruiker op en voeg een marker toe
   */
  async getCurrentLocation(): Promise<void> {
    if (!navigator.geolocation) {
      throw new Error('Geolocatie wordt niet ondersteund door deze browser');
    }
      
    try {
      const position = await this.getPosition();
      const latlng = L.latLng(position.coords.latitude, position.coords.longitude);

      this.locatieConfigService.loadConfig().subscribe((config: any) => {
        this.config = config;
        this.addMarkerAtLocation(latlng);
      });
    } catch (error: any) {
      console.error('Fout bij ophalen locatie:', error);
      throw new Error(this.mapGeolocationError(error));
    }
  }

  /**
   * Verkrijg de huidige positie van de gebruiker
   */
  private getPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve, 
        reject, 
        this.geolocationOptions
      );
    });
  }

  /**
   * Voeg een marker toe op de opgegeven locatie
   */
  private async addMarkerAtLocation(latlng: L.LatLng): Promise<void> {
    console.log('KaartService: addMarkerAtLocation called');
    if (!this.map) {
      throw new Error('Kaart is niet geïnitialiseerd');
    }

    if (!this.config) {
      console.warn('Config not loaded yet, returning');
      return;
    }

    // Verwijder bestaande marker
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    // Voeg nieuwe marker toe
    this.marker = L.marker(latlng).addTo(this.map);
    
    // Verplaats de kaart naar de nieuwe locatie
    this.map.setView(latlng, 16);

    // Haal adresgegevens op van OpenStreetMap
    try {
      // In een echte implementatie zou je hier een HTTP-request doen naar Nominatim
      // Voor nu simuleren we het resultaat
      const response: any = {
        display_name: `Locatie op ${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`,
        address: {
          road: 'Onbekende straat',
          house_number: '',
          postcode: '',
          city: this.config?.gebied.naam || 'Groningen',
          municipality: this.config?.gebied.naam || 'Groningen',
          county: this.config?.gebied.naam || 'Groningen',
          state: this.config?.gebied.naam || 'Groningen',
          country: this.config?.gebied.land || 'Nederland',
          neighbourhood: ''
        }
      };
      
      // Controleer of de locatie binnen het toegestane gebied ligt
      if (this.config && !this.locatieConfigService.isToegestaanGebied(latlng.lat, latlng.lng)) {
        throw new Error(`Locatie valt niet binnen het toegestane gebied: ${this.config.gebied.naam}`);
      }
      
      this.addressSelected.emit(response.display_name);
      
      // Emit location selection with coordinates
      this.locationSelected.emit({
        latitude: latlng.lat,
        longitude: latlng.lng,
        address: response.display_name
      });
      
      // Toon adres in een popup
      this.marker.bindPopup(response.display_name).openPopup();
    } catch (error: any) {
      console.error('Fout bij ophalen adresgegevens:', error);
      const errorMessage = error.message || 'Fout bij ophalen adresgegevens';
      this.marker.bindPopup(errorMessage).openPopup();
      throw error;
    }
  }

  /**
   * Zoek een adres en voeg een marker toe
   */
  async searchAddress(address: string): Promise<void> {
    console.log('KaartService: searchAddress called');
    console.log('searchAddress: this.config', this.config);
    console.log('searchAddress: this.config.gebied', this.config?.gebied);
    if (!this.map) {
      throw new Error('Kaart is niet geïnitialiseerd');
    }

    if (!this.config) {
      console.warn('Config not loaded yet, returning');
      return;
    }

    try {
      // In een echte implementatie zou je hier een HTTP-request doen
      // Voor nu simuleren we het resultaat
      const result: any = {
        lat: this.defaultLocation.lat,
        lon: this.defaultLocation.lng,
        display_name: address,
        address: {
          road: address,
          city: this.config?.gebied.naam || 'Groningen',
          municipality: this.config?.gebied.naam || 'Groningen',
          county: this.config?.gebied.naam || 'Groningen',
          state: this.config?.gebied.naam || 'Groningen',
          country: this.config?.gebied.land || 'Nederland'
        }
      };
      
      // Controleer of de locatie binnen het toegestane gebied ligt
      if (this.config && !this.locatieConfigService.isToegestaanGebied(parseFloat(result.lat), parseFloat(result.lon))) {
        throw new Error(`Locatie valt niet binnen het toegestane gebied: ${this.config.gebied.naam}`);
      }
      
      const latlng = L.latLng(parseFloat(result.lat), parseFloat(result.lon));
      await this.addMarkerAtLocation(latlng);
      this.addressSelected.emit(result.display_name);
      
      // Emit location selection with coordinates
      this.locationSelected.emit({
        latitude: latlng.lat,
        longitude: latlng.lng,
        address: result.display_name
      });
    } catch (error: any) {
      console.error('Error searching address:', error);
      throw new Error(`Adres niet gevonden of valt buiten toegestaan gebied: ${error.message}`);
    }
  }

  /**
   * Map geolocatie fouten naar begrijpelijke berichten
   */
  private mapGeolocationError(error: GeolocationPositionError): string {
    switch (error.code) {
      case GeolocationPositionError.PERMISSION_DENIED:
        return 'Toestemming voor locatiegegevens geweigerd. Controleer uw browserinstellingen.';
      case GeolocationPositionError.POSITION_UNAVAILABLE:
        return 'Locatiegegevens niet beschikbaar. Probeer het later opnieuw.';
      case GeolocationPositionError.TIMEOUT:
        return 'Time-out bij ophalen locatiegegevens. Probeer het opnieuw.';
      default:
        return 'Onbekende fout bij ophalen locatiegegevens.';
    }
  }
}