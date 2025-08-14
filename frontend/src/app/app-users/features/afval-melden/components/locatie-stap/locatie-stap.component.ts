import { Component, inject, input, output, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { InputTextModule } from 'primeng/inputtext';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ProgressBarModule } from 'primeng/progressbar';
import { MeldingsProcedureStatus } from '../../services/melding/melding-state.service';
import { LocatieResultaat, GEOCODING_SERVICE_TOKEN } from '../../interfaces/geocoding.interface';
import { GeocodingMockService } from '../../services/locatie/geocoding-mock.service';
import { KaartComponent } from '../kaart/kaart.component';
import { KaartService, GebiedInfo } from '../../../../../services/kaart';
import { LocatiePicker } from '../../../../../afvalmelding/locatie/locatie-picker/locatie-picker';

/**
 * Component voor het bepalen van de locatie waar het afval zich bevindt.
 * 
 * Deze component biedt twee methoden voor locatie bepaling:
 * 1. GPS locatie ophalen (huidige positie)
 * 2. Adres zoeken via tekst invoer
 * 
 * Features:
 * - Automatische GPS locatie met gebruiker toestemming
 * - Adres zoekfunctionaliteit met autocomplete
 * - Geocoding: adres ↔ GPS coördinaten conversie
 * - Validatie of locatie binnen gemeente Groningen ligt
 * - Kaart preview van geselecteerde locatie
 * - Error handling voor locatie services
 * 
 * @example
 * ```html
 * <app-locatie-stap 
 *   [disabled]="false"
 *   (locatieGeselecteerd)="onLocatieGeselecteerd($event)"
 *   (navigatieTerug)="onTerug()"
 *   (navigatieVolgende)="onVolgende()">
 * </app-locatie-stap>
 * ```
 */
@Component({
  selector: 'app-locatie-stap',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, CardModule, MessageModule, InputTextModule, AutoCompleteModule, ProgressBarModule, LocatiePicker],
  templateUrl: './locatie-stap.component.html',
  styleUrls: ['./locatie-stap.component.scss'],
  providers: [
    { provide: GEOCODING_SERVICE_TOKEN, useClass: GeocodingMockService }
  ]
})
export class LocatieStapComponent {
  
  // Dependency injection
  protected readonly state = inject(MeldingsProcedureStatus);
  private readonly geocodingService = inject(GEOCODING_SERVICE_TOKEN);
  private readonly kaartService = inject(KaartService);
  
  // Input properties
  /** Schakelt de component uit wanneer true */
  readonly disabled = input<boolean>(false);
  
  // Output events
  /** Event dat wordt uitgezonden wanneer een locatie is geselecteerd */
  readonly locatieGeselecteerd = output<{latitude: number, longitude: number, adres: string, gebiedInfo?: GebiedInfo}>();
  /** Event voor navigatie terug */
  readonly navigatieTerug = output<void>();
  /** Event voor navigatie naar volgende stap */
  readonly navigatieVolgende = output<void>();
  
  // Component state signals
  /** Geeft aan of GPS locatie wordt opgehaald */
  protected readonly gpsBezig = signal<boolean>(false);
  /** Geeft aan of adres wordt opgezocht */
  protected readonly adresZoekenBezig = signal<boolean>(false);
  /** Uitgebreide locatie informatie */
  protected readonly locatieDetails = signal<LocatieResultaat | null>(null);
  /** Gebied informatie van OpenStreetMap */
  protected readonly gebiedInfo = signal<GebiedInfo | null>(null);
  /** Lijst van adres suggesties voor autocomplete */
  protected readonly adresSuggesties = signal<string[]>([]);
  /** Geselecteerd adres voor autocomplete */
  protected readonly geselecteerdAdres = signal<string>('');

  /**
   * Navigeert terug naar de vorige stap
   */
  protected terug(): void { 
    this.navigatieTerug.emit();
    this.state.gaTerugNaarVorige(); 
  }
  
  /**
   * Navigeert naar de volgende stap
   */
  protected volgende(): void { 
    this.navigatieVolgende.emit();
    this.state.gaNaarVolgende(); 
  }

  /**
   * Haalt de huidige GPS locatie op en converteert naar adres
   * - Vraagt gebruiker toestemming voor locatie toegang
   * - Gebruikt high accuracy GPS voor beste resultaat
   * - Controleert of locatie binnen gemeente Groningen ligt
   * - Haalt leesbaar adres op via geocoding service
   */
  protected async getCurrentLocation(): Promise<void> {
    if (this.disabled() || this.gpsBezig()) return;
    
    this.gpsBezig.set(true);
    this.state.setLocatieError('');
    
    try {
      // GPS locatie ophalen
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minuten cache
          }
        );
      });

      const { latitude, longitude } = position.coords;
      
      // Analyseer locatie met uitgebreide informatie
      const locatieAnalyse = await this.geocodingService.analyseLocatie(latitude, longitude).toPromise();
      if (!locatieAnalyse) {
        throw new Error('Locatie informatie kon niet worden opgehaald');
      }
      
      // Controleer of binnen provincie Groningen
      if (!locatieAnalyse.provincieGroningen) {
        throw new Error('Locatie ligt buiten provincie Groningen');
      }
      
      // Sla locatie en details op
      this.locatieDetails.set(locatieAnalyse);
      this.state.setLocatie(locatieAnalyse.volledigAdres, { lat: latitude, lng: longitude });
      
      
      this.locatieGeselecteerd.emit({ 
        latitude, 
        longitude, 
        adres: locatieAnalyse.volledigAdres 
      });
      
    } catch (error: any) {
      console.error('GPS locatie ophalen mislukt:', error);
      let errorMessage = 'Locatie kon niet worden bepaald';
      
      if (error.code === 1) {
        errorMessage = 'Locatie toegang geweigerd. Sta locatie toe in je browser.';
      } else if (error.code === 2) {
        errorMessage = 'Locatie niet beschikbaar. Controleer je GPS instellingen.';
      } else if (error.code === 3) {
        errorMessage = 'Locatie ophalen duurde te lang. Probeer het opnieuw.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      this.state.setLocatieError(errorMessage);
    } finally {
      this.gpsBezig.set(false);
    }
  }

  /**
   * Zoekt een adres op en converteert naar GPS coördinaten
   * - Valideert invoer (niet leeg)
   * - Gebruikt geocoding service voor adres → GPS conversie
   * - Controleert of gevonden locatie binnen Groningen ligt
   * 
   * @param adres Het te zoeken adres
   */
  protected async zoekAdres(adres: string): Promise<void> {
    if (!adres?.trim() || this.disabled() || this.adresZoekenBezig()) return;
    
    this.adresZoekenBezig.set(true);
    this.state.setLocatieError('');
    
    try {
      // Haal coördinaten op voor adres
      const coordinates = await this.geocodingService.getCoordinatenVanAdres(adres.trim()).toPromise();
      if (!coordinates) {
        throw new Error('Adres niet gevonden');
      }
      
      // Analyseer locatie met uitgebreide informatie
      const locatieAnalyse = await this.geocodingService.analyseLocatie(
        coordinates.latitude, 
        coordinates.longitude
      ).toPromise();
      
      if (!locatieAnalyse) {
        throw new Error('Locatie informatie kon niet worden opgehaald');
      }
      
      // Controleer of binnen provincie Groningen
      if (!locatieAnalyse.provincieGroningen) {
        throw new Error('Adres ligt buiten provincie Groningen');
      }
      
      // Sla locatie en details op
      this.locatieDetails.set(locatieAnalyse);
      this.state.setLocatie(locatieAnalyse.volledigAdres, { 
        lat: coordinates.latitude, 
        lng: coordinates.longitude 
      });
      
      
      this.locatieGeselecteerd.emit({ 
        latitude: coordinates.latitude, 
        longitude: coordinates.longitude, 
        adres: locatieAnalyse.volledigAdres 
      });
      
    } catch (error: any) {
      console.error('Adres zoeken mislukt:', error);
      this.state.setLocatieError(error.message || 'Adres niet gevonden');
    } finally {
      this.adresZoekenBezig.set(false);
    }
  }


  /**
   * Zoekt adres suggesties voor autocomplete
   * @param event Het zoek event van de autocomplete
   */
  protected async searchAdresSuggesties(event: any): Promise<void> {
    const query = event.query;
    if (!query || query.length < 3) {
      this.adresSuggesties.set([]);
      return;
    }

    try {
      // In een echte implementatie zou je hier een API call maken
      // voor adres suggesties. Voor nu gebruiken we mock data.
      const suggesties = [
        `${query}, Groningen`,
        `${query}straat, Groningen`,
        `${query}weg, Groningen`
      ];
      this.adresSuggesties.set(suggesties);
    } catch (error) {
      console.error('Fout bij ophalen adres suggesties:', error);
      this.adresSuggesties.set([]);
    }
  }

  /**
   * Handelt locatie selectie via de kaart component af
   * @param locatieInfo Informatie over de geselecteerde locatie
   */
  protected async onKaartLocatieGeselecteerd(locatieInfo: {latitude: number, longitude: number, address: string, wijk?: string, buurt?: string, gemeente?: string}): Promise<void> {
    try {
      // Haal uitgebreide gebied informatie op via KaartService
      const gebiedInfo = await this.kaartService.getGebiedInfoByCoordinate(locatieInfo.latitude, locatieInfo.longitude);
      
      if (gebiedInfo) {
        // Controleer of binnen provincie Groningen (Nederland specifieke controle)
        const isGroningen = gebiedInfo.gemeente?.toLowerCase().includes('groningen') || 
                           gebiedInfo.provincie?.toLowerCase().includes('groningen');
        
        if (!isGroningen) {
          this.state.setLocatieError('Locatie ligt buiten de provincie Groningen');
          return;
        }

        // Sla gebied informatie op
        this.gebiedInfo.set(gebiedInfo);
        
        // Converteer naar het verwachte formaat voor backward compatibility
        const locatieResultaat: LocatieResultaat = {
          volledigAdres: locatieInfo.address,
          stadGroningen: isGroningen,
          gemeenteGroningen: isGroningen,
          provincieGroningen: true,
          wijk: gebiedInfo.wijk,
          coordinaten: {
            latitude: locatieInfo.latitude,
            longitude: locatieInfo.longitude
          }
        };
        
        this.locatieDetails.set(locatieResultaat);
        this.state.setLocatie(locatieInfo.address, { lat: locatieInfo.latitude, lng: locatieInfo.longitude });
        this.geselecteerdAdres.set(locatieInfo.address);
        
        // Emit event met gebied informatie
        this.locatieGeselecteerd.emit({
          latitude: locatieInfo.latitude,
          longitude: locatieInfo.longitude,
          adres: locatieInfo.address,
          gebiedInfo: gebiedInfo
        });
      }
    } catch (error) {
      console.error('Fout bij verwerken kaart locatie:', error);
      this.state.setLocatieError('Kon locatie informatie niet ophalen');
    }
  }
}