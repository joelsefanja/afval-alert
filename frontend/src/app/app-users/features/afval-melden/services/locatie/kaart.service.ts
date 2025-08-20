import { Injectable, inject } from '@angular/core';
import * as leaflet from 'leaflet';
import { LocatieConfigService } from '@app/services/locatie-config.service';
import { KaartInitialisatieService } from './kaart/kaart-initialisatie.service';
import { KaartMarkerService } from './kaart/kaart-marker.service';
import { KaartGeolocationService } from './kaart/kaart-geolocation.service';
import { GeocodingService } from './geocoding/geocoding.service';
import { Kaart3dService } from './kaart/kaart-3d.service';

@Injectable({
  providedIn: 'root'
})
export class KaartService {
  private kaart: leaflet.Map | null = null;
  private marker: leaflet.Marker | null = null;
  private config: any;

  private kaartInit = inject(KaartInitialisatieService);
  private kaartMarker = inject(KaartMarkerService);
  private geolocation = inject(KaartGeolocationService);
  private locatieConfig = inject(LocatieConfigService);
  private geocoding = inject(GeocodingService);
  private kaart3d = inject(Kaart3dService);

  // Expose signals en events van sub-services
  readonly isKaartKlaar = this.kaartInit.isKaartKlaar;
  readonly huidigeMarker = this.kaartMarker.huidigeMarker;
  readonly adresGeselecteerd = this.kaartMarker.adresGeselecteerd;
  readonly locatieGeselecteerd = this.kaartMarker.locatieGeselecteerd;

  constructor() {
    this.locatieConfig.loadConfig().subscribe((config: any) => {
      this.config = config;
    });
  }

  async initialiseerKaart(kaartElement: HTMLElement): Promise<void> {
    this.verwijderKaart();
    
    // Initialize simple 2D Leaflet map
    this.kaart = this.kaartInit.initialiseerKaart(kaartElement, (event) => {
      this.voegMarkerToeOpLocatie(event.latlng);
    });
  }


  verwijderKaart(): void {
    // Clean up 2D map
    this.kaartInit.verwijderKaart(this.kaart);
    this.kaart = null;
    this.marker = null;
  }

  setMarker(latitude: number, longitude: number, address?: string): void {
    // Simple 2D Leaflet implementation
    if (!this.kaart) return;
    
    // EERST: Pin plaatsen
    this.verwijderMarker();
    this.marker = this.kaartMarker.setMarker(this.kaart, latitude, longitude, address);
    
    // DAN: Na korte delay naar locatie navigeren
    setTimeout(() => {
      if (this.kaart) {
        const locatie = leaflet.latLng(latitude, longitude);
        this.kaart.setView(locatie, 16, {
          animate: true,
          duration: 1.0
        });
      }
    }, 300); // Pin wordt eerst getoond, dan navigatie
  }

  verwijderMarker(): void {
    this.kaartMarker.verwijderMarker(this.kaart!, this.marker);
    this.marker = null;
  }

  getHuidigeMarker() {
    return this.kaartMarker.getHuidigeMarker();
  }

  async getHuidigeLocatie(): Promise<void> {
    try {
      const positie = await this.geolocation.getHuidigePositie();
      const locatie = leaflet.latLng(positie.coords.latitude, positie.coords.longitude);
      await this.voegMarkerToeOpLocatie(locatie);
    } catch (error: any) {
      console.error('Fout bij ophalen locatie:', error);
      throw new Error(this.geolocation.mapGeolocationError(error));
    }
  }

  async zoekAdres(adres: string): Promise<void> {
    if (!this.kaart) {
      throw new Error('Kaart is niet genitialiseerd');
    }

    const standaardLoc = this.kaartInit.getStandaardLocatie();
    const resultaat = {
      lat: standaardLoc.latitude,
      lon: standaardLoc.longitude,
      display_name: adres
    };
    
    const locatie = leaflet.latLng(parseFloat(resultaat.lat.toString()), parseFloat(resultaat.lon.toString()));
    await this.voegMarkerToeOpLocatie(locatie);
    this.kaartMarker.emitLocatieEvents(locatie.lat, locatie.lng, resultaat.display_name);
  }

  /**
   * Handle location selection for 3D map
   */
  private async voegMarkerToeOpLocatie3d(lat: number, lng: number, address?: string): Promise<void> {
    try {
      // Get readable address if not provided
      let displayName = address;
      if (!displayName) {
        try {
          displayName = await this.geocoding.reverseGeocode(lat, lng);
        } catch (error) {
          displayName = 'Geselecteerde locatie';
          console.warn('Reverse geocoding gefaald:', error);
        }
      }
      
      // Check if location is within allowed area
      if (this.config && !this.locatieConfig.isToegestaanGebied(lat, lng)) {
        const errorMsg = `Locatie valt niet binnen het toegestane gebied: ${this.config.gebied.naam}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      // Set marker on 3D map
      this.kaart3d.setMarker3d(lat, lng, displayName);
      
      // Emit location events
      this.kaartMarker.emitLocatieEvents(lat, lng, displayName);
      
    } catch (error) {
      console.error('Fout bij selecteren locatie op 3D kaart:', error);
      throw error;
    }
  }
  
  /**
   * Handle location selection for 2D map (existing method)
   */
  private async voegMarkerToeOpLocatie(locatie: leaflet.LatLng): Promise<void> {
    if (!this.kaart) throw new Error('Kaart is niet genitialiseerd');

    if (this.marker) {
      this.kaart.removeLayer(this.marker);
    }

    // EERST: Pin plaatsen
    this.marker = leaflet.marker(locatie).addTo(this.kaart);
    
    // DAN: Na korte delay naar locatie navigeren
    setTimeout(() => {
      if (this.kaart) {
        this.kaart.setView(locatie, 16, {
          animate: true,
          duration: 1.0
        });
      }
    }, 300); // Pin wordt eerst getoond, dan navigatie

    let displayName: string;
    try {
      displayName = await this.geocoding.reverseGeocode(locatie.lat, locatie.lng);
    } catch (error) {
      displayName = 'Geselecteerde locatie';
      console.warn('Reverse geocoding gefaald:', error);
    }
    
    if (this.config && !this.locatieConfig.isToegestaanGebied(locatie.lat, locatie.lng)) {
      const errorMsg = `Locatie valt niet binnen het toegestane gebied: ${this.config.gebied.naam}`;
      this.marker.bindPopup(errorMsg).openPopup();
      throw new Error(errorMsg);
    }
    
    this.kaartMarker.emitLocatieEvents(locatie.lat, locatie.lng, displayName);
    // No popup - address is shown below the map instead
  }
}