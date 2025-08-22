import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, input, output, computed, signal, effect } from '@angular/core';
import * as leaflet from 'leaflet';

interface KaartLocatie {
  latitude: number;
  longitude: number;
  id?: string;
  status?: 'nieuw' | 'bezig' | 'opgelost';
  type?: string;
}

/**
 * Gedeelde kaart component 
 * Herbruikbaar voor gebruikersapp en gemeente dashboard
 * Ondersteunt single/multi marker weergave
 */
@Component({
  selector: 'app-shared-kaart',
  standalone: true,
  imports: [],
  templateUrl: './shared-kaart.component.html'
})
export class SharedKaartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('kaartContainer') kaartContainer!: ElementRef<HTMLDivElement>;
  
  readonly locaties = input<KaartLocatie[]>([]);
  readonly geselecteerdeLocatie = input<KaartLocatie | null>(null);
  readonly groningenCentrum = { latitude: 53.2192, longitude: 6.5667 };
  readonly centerCoordinaten = input<{latitude: number, longitude: number}>(this.groningenCentrum); 
  readonly zoomNiveau = input(13);
  readonly hoogte = input('400px');
  readonly kaartHoogte = input('400px');
  readonly klikbaar = input(true);
  readonly kaartIsKlikbaar = input(true);
  readonly toonControls = input(true);
  readonly aspectRatio = input('16/9'); // voor tonen van de kaart
  
  readonly alsLocatieGeselecteerd = output<KaartLocatie>();
  readonly alsKaartGeladen = output<void>();
  
  private kaart: leaflet.Map | null = null;
  private markers: leaflet.Marker[] = [];
  readonly isGeladen = signal(false);
  
  readonly kaartStijl = computed(() => ({
    height: this.hoogte() || this.kaartHoogte(),
    aspectRatio: this.aspectRatio(),
    minHeight: '200px'
  }));
  
  constructor() {
    // Effect update wanneer locaties wijzigen
    effect(() => {
      const locaties = this.locaties();
      const geselecteerdeLocatie = this.geselecteerdeLocatie();
      
      if (this.kaart) {
        this.updateMarkers(locaties, geselecteerdeLocatie);
      }
    });
  }
  
  ngAfterViewInit(): void {
    this.creeerDeKaart();
  }
  
  ngOnDestroy(): void {
    if (this.kaart) {
      this.kaart.remove();
    }
  }
  
  private creeerDeKaart(): void {
    if (!this.kaartContainer) return;
    
    const center = this.centerCoordinaten();
    
    // Maak kaart aan
    this.kaart = leaflet.map(this.kaartContainer.nativeElement, {
      center: [center.latitude, center.longitude],
      zoom: this.zoomNiveau(),
      zoomControl: this.toonControls(),
      attributionControl: false
    });
    
    // Voeg tiles toe
    leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.kaart);
    
    // Click handler voor nieuwe locaties (alleen als klikbaar)
    if (this.klikbaar()) {
      this.kaart.on('click', (event: leaflet.LeafletMouseEvent) => {
        const nieuweLocatie: KaartLocatie = {
          latitude: event.latlng.lat,
          longitude: event.latlng.lng,
          id: `loc_${Date.now()}`
        };
        this.alsLocatieGeselecteerd.emit(nieuweLocatie);
      });
    }
    
    // Initial markers
    this.updateMarkers(this.locaties(), this.geselecteerdeLocatie());
    
    this.isGeladen.set(true);
    this.alsKaartGeladen.emit();
  }
  
  private updateMarkers(locaties: KaartLocatie[], geselecteerdeLocatie: KaartLocatie | null): void {
    if (!this.kaart) return;
    
    // Verwijder bestaande markers
    this.markers.forEach(marker => this.kaart!.removeLayer(marker));
    this.markers = [];
    
    // Voeg nieuwe markers toe
    locaties.forEach(locatie => {
      const isGeselecteerd = locatie === geselecteerdeLocatie;
      const marker = this.maakMarker(locatie, isGeselecteerd);
      marker.addTo(this.kaart!);
      this.markers.push(marker);
    });
    
    // Voeg geselecteerde locatie toe als deze niet in de lijst staat
    if (geselecteerdeLocatie && !locaties.includes(geselecteerdeLocatie)) {
      const marker = this.maakMarker(geselecteerdeLocatie, true);
      marker.addTo(this.kaart!);
      this.markers.push(marker);
    }
    
    // Auto-fit naar markers indien meerdere locaties
    const meerdereLocatiesGemarkeerd = this.markers.length > 1;
    if (meerdereLocatiesGemarkeerd) {
      this.zoomUit();
    }

    const enkeleLocatieGeselecteerd = this.kaart && this.markers.length == 1;

    if (enkeleLocatieGeselecteerd) {
        this.centreerOpLocatie(geselecteerdeLocatie!);
    }
  }  

    private zoomUit(): void {
      const functieGroep = new leaflet.FeatureGroup(this.markers);
      this.kaart?.fitBounds(functieGroep.getBounds().pad(0.1));
   }
  
  private maakMarker(locatie: KaartLocatie, isGeselecteerd: boolean): leaflet.Marker {
    // Bepaal marker icoon op basis van status en selectie
    const iconUrl = this.getMarkerIcon(locatie, isGeselecteerd);
    
    const customIcon = leaflet.icon({
      iconUrl,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });
    
    const marker = leaflet.marker([locatie.latitude, locatie.longitude], { 
      icon: customIcon 
    });
  
    // Click handler voor marker selectie
    if (this.klikbaar()) {
      marker.on('click', () => {
        this.alsLocatieGeselecteerd.emit(locatie);
      });
    }
    
    return marker;
  }

  public getMap(): leaflet.Map | null {
    return this.kaart;
  }
  
  
  private getMarkerIcon(locatie: KaartLocatie, isGeselecteerd: boolean): string {
    // Gebruik standaard Leaflet marker kleuren via CSS styling
    if (locatie.status) {
      switch (locatie.status) {
        case 'nieuw': return isGeselecteerd ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png' : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png';
        case 'bezig': return isGeselecteerd ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png' : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png';
        case 'opgelost': return isGeselecteerd ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png' : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png';
      }
    }
    
    // Default markers voor gebruikersapp
    return isGeselecteerd 
      ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png'
      : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png';
  }
  
  // Public methods voor externe controle
  centreerOpLocatie(locatie: KaartLocatie): void {
    if (this.kaart) {
      this.kaart.setView([locatie.latitude, locatie.longitude], this.zoomNiveau());
    }
  }
  
  krijgKaartCenter(): KaartLocatie | null {
    if (!this.kaart) return null;
    
    const center = this.kaart.getCenter();
    return {
      latitude: center.lat,
      longitude: center.lng
    };
  }
}