import { Component, input, output, inject, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { LocatieService } from '@services/locatie/locatie.service';
import { Locatie } from '@interfaces/locatie.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-kaart',
  standalone: true,
  imports: [ButtonModule],
  template: `
    <div class="relative w-full h-full overflow-hidden border-round-2xl bg-surface-100" 
         style="min-height: 400px; height: 400px; width: 100%;">
      <!-- Map Container -->
      <div #mapContainer class="w-full h-full map-container" 
           style="min-height: 400px; height: 400px; width: 100%; position: relative; display: block;"></div>
      
      <!-- Close Button -->
      <div class="absolute top-3 right-3 z-50">
        <p-button 
          icon="pi pi-times" 
          (onClick)="onClose()"
          size="small"
          severity="secondary"
          text
          rounded
          class="bg-white shadow-3 hover:shadow-4 transition-all duration-200">
        </p-button>
      </div>
      
      <!-- 3D Map Indicator -->
      <div class="absolute top-3 left-3 z-50">
        <div class="bg-white bg-opacity-90 backdrop-blur-sm px-3 py-2 border-round-xl shadow-3 text-sm font-medium text-primary-700">
          <i class="pi pi-cube mr-2 text-primary-500"></i>
          3D Kaart - Kleurrijke Gebouwen
        </div>
      </div>
      
      <!-- Simple Instructions -->
      <div class="absolute bottom-3 left-3 right-3 z-50 text-center">
        <div class="bg-white bg-opacity-95 backdrop-blur-sm p-3 border-round-xl shadow-3 text-sm text-surface-700 font-medium">
          <i class="pi pi-map-marker mr-2 text-red-500"></i>
          Klik op de kaart om een locatie te selecteren
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    
    /* Ensure map container is properly sized */
    .map-container {
      position: relative !important;
      width: 100% !important;
      height: 400px !important;
      min-height: 400px !important;
      display: block !important;
      background-color: #f0f0f0 !important;
    }
    
    /* OpenLayers map styling fixes */
    ::ng-deep .ol-viewport {
      position: relative !important;
      width: 100% !important;
      height: 100% !important;
    }
    
    ::ng-deep .ol-layers {
      position: relative !important;
      width: 100% !important;
      height: 100% !important;
    }
    
    ::ng-deep canvas.ol-layer {
      position: absolute !important;
      width: 100% !important;
      height: 100% !important;
    }
    
    /* Custom styles for 3D map controls */
    ::ng-deep .custom-zoom-control {
      top: 60px !important;
      right: 12px !important;
    }
    
    ::ng-deep .ol-zoom button {
      background: white !important;
      border: none !important;
      border-radius: 8px !important;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
      margin: 2px !important;
      width: 32px !important;
      height: 32px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-weight: bold !important;
      color: #374151 !important;
      transition: all 0.2s !important;
    }
    
    ::ng-deep .ol-zoom button:hover {
      background: #f3f4f6 !important;
      transform: scale(1.05) !important;
    }
    
    /* Hide default attribution */
    ::ng-deep .ol-attribution {
      display: none !important;
    }
    
    /* Custom marker animations for 3D map */
    ::ng-deep .maplibregl-marker {
      animation: markerBounce 0.6s ease-out;
    }
    
    @keyframes markerBounce {
      0% { transform: translateY(-200px) scale(0.5); opacity: 0; }
      60% { transform: translateY(10px) scale(1.1); opacity: 1; }
      80% { transform: translateY(-5px) scale(0.95); }
      100% { transform: translateY(0) scale(1); }
    }
  `]
})
export class KaartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;
  
  private locatieService = inject(LocatieService);
  private subscription?: Subscription;
  
  selectedLocation = input<Locatie | null>(null);
  locationSelected = output<Locatie>();
  mapClosed = output<void>();
  addressSelected = output<string>();

  ngAfterViewInit() {
    // Initialize the 3D map with a slight delay to ensure DOM is ready
    setTimeout(async () => {
      if (this.mapContainer) {
        try {
          // Ensure container has dimensions before initializing
          const container = this.mapContainer.nativeElement;
          
          // Wait for container to have proper dimensions
          let attempts = 0;
          while ((container.clientWidth === 0 || container.clientHeight === 0) && attempts < 10) {
            await new Promise(resolve => setTimeout(resolve, 50));
            attempts++;
          }
          
          const containerWidth = container.clientWidth;
          const containerHeight = container.clientHeight;
          
          if (containerWidth === 0 || containerHeight === 0) {
            console.warn('Map container still has invalid dimensions after waiting:', `${containerWidth}x${containerHeight}`);
            // Set a minimum height if needed
            container.style.minHeight = '400px';
          }
          
          await this.locatieService.initialiseerKaart(this.mapContainer.nativeElement);
          
          // Try to get current location (but don't wait for permission)
          this.probeerHuidigeLocatie();
          
          // Update map size after a short delay to ensure it's properly rendered
          setTimeout(() => {
            // Force update map size
            const kaartService = (this.locatieService as any).kaartService;
            if (kaartService && kaartService.kaart3d) {
              kaartService.kaart3d.updateMapSize();
            }
          }, 200);
          
        } catch (error) {
          console.error('Fout bij initialiseren kaart:', error);
        }
      }
    }, 150); // Increased delay a bit
    
    // Subscribe to address selections
    this.subscription = this.locatieService.adresGeselecteerd.subscribe(
      (address: string) => {
        this.addressSelected.emit(address);
      }
    );

    // Subscribe to location selections from the map
    this.locatieService.locatieGeselecteerd.subscribe(
      (location: {latitude: number, longitude: number, address: string}) => {
        this.locationSelected.emit({
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address
        });
      }
    );
    
    // Set marker if location provided
    const location = this.selectedLocation();
    if (location) {
      setTimeout(() => {
        this.locatieService.setMarker(location.latitude, location.longitude, location.address);
      }, 500); // Give map time to initialize
    }
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
    this.locatieService.verwijderKaart();
  }

  onClose() {
    this.mapClosed.emit();
  }
  
  /**
   * Try to get current location if permission is already granted
   */
  private async probeerHuidigeLocatie(): Promise<void> {
    if (!navigator.geolocation) {
      return;
    }
    
    try {
      // Check geolocation permission status
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' as any });
        
        // If permission is already granted, fetch the location
        if (permission.state === 'granted') {
          this.haalHuidigeLocatieOp();
        }
      } else {
        // Fallback for browsers that don't support permissions API
        this.haalHuidigeLocatieOp();
      }
    } catch (error) {
      // Silently fail if we can't check permissions
      console.debug('Kon toestemming status niet controleren:', error);
    }
  }
  
  /**
   * Get current location and show on map with smooth animation
   */
  private async haalHuidigeLocatieOp(): Promise<void> {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 300000 // 5 minutes cache
        });
      });
      
      const { latitude, longitude } = position.coords;
      
      // Show location immediately on 3D map with animation
      this.locatieService.setMarker(latitude, longitude, 'Huidige locatie');
      
      // Get full address in background and update
      setTimeout(async () => {
        try {
          const adresData = await this.locatieService.getAddressFromCoordinates(latitude, longitude);
          const fullAddress = `${adresData.street} ${adresData.houseNumber}, ${adresData.city}`;
          
          // Update marker with full address
          this.locatieService.setMarker(latitude, longitude, fullAddress);
        } catch (error) {
          console.warn('Kon volledig adres niet ophalen:', error);
        }
      }, 1000);
      
    } catch (error) {
      // Silent fail - user didn't grant permission or location unavailable
      console.debug('Kon huidige locatie niet ophalen:', error);
    }
  }
}