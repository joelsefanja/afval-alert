import { Injectable, inject, signal } from '@angular/core';
import { AfvalMeldingStateService } from '@services/melding';
import { FormattedAddress, Locatie } from '@interfaces/locatie.interface';
import { KaartService } from './kaart.service';
import { KaartGeolocationService } from './kaart/kaart-geolocation.service';
import { GeocodingService } from './geocoding/geocoding.service';
import { AdresFormatterService } from './geocoding/adres-formatter.service';
import { LocatieValidatieService } from './validatie/locatie-validatie.service';
import { LocatieGegevensDto } from '@services/melding/dto/frontend.dto';

@Injectable({
  providedIn: 'root'
})
export class LocatieService {
  private afvalMeldingService: AfvalMeldingStateService = inject(AfvalMeldingStateService);
  private kaartService: KaartService = inject(KaartService);
  private geolocationService: KaartGeolocationService = inject(KaartGeolocationService);
  private geocodingService: GeocodingService = inject(GeocodingService);
  private adresFormatter: AdresFormatterService = inject(AdresFormatterService);
  private validatieService: LocatieValidatieService = inject(LocatieValidatieService);

  // State signals
  readonly isLoading = signal(false);
  readonly currentLocation = signal<Locatie | null>(null);

  // Expose kaart events and signals
  readonly isKaartKlaar = this.kaartService.isKaartKlaar;
  readonly huidigeMarker = this.kaartService.huidigeMarker;
  readonly adresGeselecteerd = this.kaartService.adresGeselecteerd;
  readonly locatieGeselecteerd = this.kaartService.locatieGeselecteerd;

  // === LOCATIE API DELEGATIE ===
  async getCurrentPosition(): Promise<{ breedtegraad: number; lengtegraad: number }> {
    const positie = await this.geolocationService.getHuidigePositie();
    return { breedtegraad: positie.coords.latitude, lengtegraad: positie.coords.longitude }
  }

  async getCurrentLocation(): Promise<Locatie> {
    this.isLoading.set(true);
    try {
      const position = await this.getCurrentPosition();
      const address = await this.getAddressFromCoordinates(position.breedtegraad, position.lengtegraad);
      const locatie: Locatie = {
        latitude: position.breedtegraad,
        longitude: position.lengtegraad,
        address: address.street ? `${address.street} ${address.houseNumber}, ${address.city}` : 'Huidige locatie'
      };
      this.currentLocation.set(locatie);
      return locatie;
    } finally {
      this.isLoading.set(false);
    }
  }

  async getAddressFromCoordinates(breedtegraad: number, lengtegraad: number): Promise<FormattedAddress> {
    return this.geocodingService.getAddressFromCoordinates(breedtegraad, lengtegraad);
  }

  async getCoordinatesFromAddress(adres: string): Promise<{ breedtegraad: number; lengtegraad: number }> {
    const result = await this.geocodingService.getCoordinatesFromAddress(adres);
    return {
      breedtegraad: result.lat,
      lengtegraad: result.lng
    };
  }

  async reverseGeocode(breedtegraad: number, lengtegraad: number): Promise<string> {
    return this.geocodingService.reverseGeocode(breedtegraad, lengtegraad);
  }

  async searchAddress(query: string): Promise<Locatie[]> {
    const results = await this.geocodingService.searchAddress(query);
    return results.map(result => ({
      latitude: result.lat,
      longitude: result.lng,
      address: result.address
    }));
  }

  setCurrentLocation(location: Locatie): void {
    this.currentLocation.set(location);
  }

  // === ADRES VERWERKING ===
  async getDetailedAddressData(locatieInformatie: any): Promise<FormattedAddress> {
    return this.getAddressFromCoordinates(locatieInformatie.breedtegraad, locatieInformatie.lengtegraad);
  }

  enrichLocationWithAddressData(locatieInformatie: any, adresGegevens: FormattedAddress): any {
    return this.adresFormatter.enrichLocationWithAddressData(locatieInformatie, adresGegevens);
  }

  // === VALIDATIE ===
  async valideerLocatie(breedtegraad: number, lengtegraad: number): Promise<boolean> {
    return this.validatieService.valideerLocatie(breedtegraad, lengtegraad);
  }

  isValidQuery(query: string): query is string {
    return this.geocodingService.isValidQuery(query);
  }

  isValidLocationInfo(locatieInformatie: any): boolean {
    return this.validatieService.isValidLocationInfo(locatieInformatie);
  }

  // === STATE MANAGEMENT ===
  private saveLocationInfo(locatieInformatie: LocatieGegevensDto): void {
    // TODO: Fix this reference
    // this.afvalMeldingService.plaatsLocatie(locatieInformatie);
  }

  // === KAART DELEGATIE ===
  async initialiseerKaart(kaartElement: HTMLElement): Promise<void> {
    await this.kaartService.initialiseerKaart(kaartElement);
  }

  verwijderKaart(): void {
    this.kaartService.verwijderKaart();
  }

  setMarker(breedtegraad: number, lengtegraad: number, adres?: string): void {
    this.kaartService.setMarker(breedtegraad, lengtegraad, adres);
  }

  verwijderMarker(): void {
    this.kaartService.verwijderMarker();
  }

  getHuidigeMarker() {
    return this.kaartService.getHuidigeMarker();
  }

  async getHuidigeLocatie(): Promise<void> {
    return this.kaartService.getHuidigeLocatie();
  }

  async zoekAdres(adres: string): Promise<void> {
    return this.kaartService.zoekAdres(adres);
  }
}