import { Component, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LocatieStapService } from '@services/proces/stappen';
import { GeocodingService } from '@services/locatie/geocoding/geocoding.service';
import { StapComponent } from '@components/shared/stap.component';
import { InputTextModule } from 'primeng/inputtext';
import { KaartComponent } from './components/kaart/kaart.component';

@Component({
  selector: 'app-locatie-selectie',
  standalone: true,
  imports: [
    ButtonModule, 
    MessageModule, 
    ProgressSpinnerModule,
    InputTextModule,
    KaartComponent
  ],
  templateUrl: './locatie-selectie.component.html'
})
export class LocatieSelectieComponent extends StapComponent {
  public locatieProcesService = inject(LocatieStapService);
  private geocodingService = inject(GeocodingService);

  readonly huidigeLocatie = this.locatieProcesService.currentLocatie;
  readonly error = this.locatieProcesService.errorMessage;
  readonly isLoading = this.locatieProcesService.isLoading;
  readonly showMap = signal(true); // Kaart direct tonen
  readonly searchQuery = signal('');
  readonly huidigeLocatieButtonLabel = signal('Huidige locatie');
  readonly isHuidigeLocatieLoading = signal(false);
  foutmelding: string = '';
  
  // Animation timer for button label
  private buttonAnimationTimer: any = null;

  onLocationSelected(location: {latitude: number, longitude: number, address: string, wijk?: string, buurt?: string, gemeente?: string} | string) {
    // If it's a string, we need to convert it to a Locatie object
    if (typeof location === 'string') {
      // For now, we'll just emit an event to indicate a location was selected
      // The actual location data should come from the locatie component
      // TODO: Handle string location properly
    } else {
      // It's already a Locatie object
      this.locatieProcesService.locatieSelecteren(location);
    }
  }

  getSelectedLocationForMap() {
    const loc = this.huidigeLocatie();
    if (!loc) return null;
    
    return {
      latitude: loc.latitude,
      longitude: loc.longitude,
      address: loc.address
    };
  }

  onKaartOpenen() {
    this.showMap.set(true);
  }

  onKaartSluiten() {
    this.showMap.set(false);
  }

  onVolgende() {
    this.locatieProcesService.nextStep();
  }

  onVorige() {
    this.locatieProcesService.previousStep();
  }

  async onSearch() {
    const query = this.searchQuery().trim();
    if (!query) return;
    
    await this.locatieProcesService.searchAddress(query);
  }

  onLocationError(error: string) {
    // Gebruik een publieke methode of sla de fout direct op
    this.foutmelding = error;
  }

  updateSearchQuery(value: string) {
    this.searchQuery.set(value);
    this.locatieProcesService.clearError();
  }

  async onHuidigeLocatie() {
    if (!navigator.geolocation) {
      this.foutmelding = 'Geolocatie wordt niet ondersteund door deze browser';
      return;
    }

    try {
      this.isHuidigeLocatieLoading.set(true);
      this.huidigeLocatieButtonLabel.set('Locatie ophalen...');
      
      // Clear any existing animation timers
      if (this.buttonAnimationTimer) {
        clearTimeout(this.buttonAnimationTimer);
      }
      
      // Use faster geolocation options
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false, // Faster but less accurate
          timeout: 5000, // Shorter timeout for faster response
          maximumAge: 60000 // Accept cached positions up to 1 minute old
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Start reverse geocoding in parallel while updating the map
      const geocodingPromise = this.geocodingService.getAddressFromCoordinates(latitude, longitude);
      
      // Immediately update the map with the location
      const tempLocatie = {
        latitude,
        longitude,
        address: 'Locatie aan het ophalen...'
      };
      
      this.locatieProcesService.locatieSelecteren(tempLocatie);
      this.foutmelding = '';
      
      // Update button label immediately 
      this.huidigeLocatieButtonLabel.set('Locatie ophalen...');
      
      // Wait for full address data with a timeout
      let adresData: any = null;
      try {
        adresData = await Promise.race([
          geocodingPromise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 3000)
          )
        ]);
      } catch (error) {
        // If geocoding fails or times out, continue with coordinates only
        console.warn('Geocoding failed or timed out:', error);
      }
      
      if (adresData) {
        const locatie = {
          latitude,
          longitude,
          address: adresData.street + ' ' + adresData.houseNumber + ', ' + adresData.city,
          wijk: adresData.wijk,
          buurt: adresData.buurt,
          gemeente: adresData.gemeente
        };
        
        // Update with full location data
        this.locatieProcesService.locatieSelecteren(locatie);
        
        // Animate the button label change
        this.animateButtonLabelChange(`${adresData.street}, ${adresData.city}`);
      } else {
        // Update with generic location when address unavailable
        const locatie = {
          latitude,
          longitude,
          address: 'Huidige locatie'
        };
        
        this.locatieProcesService.locatieSelecteren(locatie);
        this.huidigeLocatieButtonLabel.set('Huidige locatie');
      }
      
    } catch (error) {
      console.error('Fout bij ophalen huidige locatie:', error);
      this.foutmelding = 'Kon huidige locatie niet ophalen. Probeer handmatig een adres in te voeren.';
      this.huidigeLocatieButtonLabel.set('Huidige locatie');
    } finally {
      this.isHuidigeLocatieLoading.set(false);
    }
  }
  
  clearSelectedLocation() {
    this.locatieProcesService.clearLocation();
    this.foutmelding = '';
  }

  /**
   * Animate the button label change with a smooth transition
   * @param newLabel The new label to display
   */
  private animateButtonLabelChange(newLabel: string): void {
    // Clear any existing timers
    if (this.buttonAnimationTimer) {
      clearTimeout(this.buttonAnimationTimer);
    }
    
    // Show coordinates first for 1 second
    // (already set in the main function)
    
    // Then animate to the full address
    this.buttonAnimationTimer = setTimeout(() => {
      this.huidigeLocatieButtonLabel.set(newLabel);
    }, 1000);
  }
}