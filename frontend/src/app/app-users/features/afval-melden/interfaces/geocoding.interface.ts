import { Observable } from 'rxjs';
import { InjectionToken } from '@angular/core';

export interface AdresInfo {
  volledigAdres: string;
  straat: string;
  huisnummer: string;
  postcode: string;
  plaats: string;
  land: string;
}

export interface LocatieResultaat {
  provincieGroningen: boolean;
  gemeenteGroningen: boolean;
  stadGroningen: boolean;
  wijk?: string;
  volledigAdres: string;
  coordinaten?: {
    latitude: number;
    longitude: number;
  };
}

export interface IGeocodingService {
  getAdresVanCoordinaten(latitude: number, longitude: number): Observable<AdresInfo>;
  getLocatieResultaat(latitude: number, longitude: number): Observable<LocatieResultaat>;
  getCoordinatenVanAdres(adres: string): Observable<{latitude: number, longitude: number}>;
}

export const GEOCODING_SERVICE_TOKEN = new InjectionToken<IGeocodingServiceInterface>('GEOCODING_SERVICE_TOKEN');

export interface IGeocodingServiceInterface {
  getAdresVanCoordinaten(latitude: number, longitude: number): Observable<AdresInfo>;
  getLocatieResultaat(latitude: number, longitude: number): Observable<LocatieResultaat>;
  getCoordinatenVanAdres(adres: string): Observable<{latitude: number, longitude: number}>;

  /**
   * Haalt adres informatie op aan de hand van GPS coördinaten
   * @param latitude Breedtegraad
   * @param longitude Lengtegraad
   * @returns Observable met adres informatie
   */
  getAdresVanCoordinaten(latitude: number, longitude: number): Observable<AdresInfo>;

  /**
   * Haalt GPS coördinaten op aan de hand van een adres
   * @param adres Het te zoeken adres
   * @returns Observable met coördinaten
   */
  getCoordinatenVanAdres(adres: string): Observable<{ latitude: number; longitude: number }>;

  /**
   * Controleert of coördinaten binnen Groningen gemeente liggen
   * @param latitude Breedtegraad
   * @param longitude Lengtegraad
   * @returns Observable boolean
   */
  isLocatieBinnenGroningen(latitude: number, longitude: number): Observable<boolean>;

  /**
   * Analyseert locatie details inclusief provincie/gemeente/stad/wijk informatie
   * @param latitude Breedtegraad
   * @param longitude Lengtegraad
   * @returns Observable met uitgebreide locatie informatie
   */
  analyseLocatie(latitude: number, longitude: number): Observable<LocatieResultaat>;
}