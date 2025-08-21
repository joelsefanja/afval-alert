import { Component, inject, signal, computed } from '@angular/core';
import { LocatieStapService } from '../../services/stappen/locatie-stap.service';
import { NavigatieService } from '../../services/navigatie/navigatie.service';
import { KaartContainerComponent } from './components/kaart-container/kaart-container.component';
import { AdresZoekerComponent } from './components/adres-zoeker/adres-zoeker.component';
import { LocatieKaartjeComponent } from './components/locatie-kaartje/locatie-kaartje.component';
import { NavigatieKnoppenComponent } from '../shared/navigatie-knoppen/navigatie-knoppen.component';

/**
 * Locatie selectie stap component
 * Gebruikt micro-components voor kaart, zoeken en locatie weergave
 */
@Component({
  selector: 'app-locatie-selectie',
  standalone: true,
  imports: [
    KaartContainerComponent,
    AdresZoekerComponent,
    LocatieKaartjeComponent,
    NavigatieKnoppenComponent
  ],
  templateUrl: './locatie-selectie.component.html'
})
export class LocatieSelectieComponent {
  // Services
  private readonly locatieStap = inject(LocatieStapService);
  private readonly navigatie = inject(NavigatieService);
  
  // State signals
  readonly zoekTekst = signal('');
  readonly kaartGeladen = signal(true);
  readonly isZoekenBezig = signal(false);
  readonly isHuidigeLocatieBezig = signal(false);
  readonly foutmelding = signal<string | null>(null);
  
  // Computed signals
  readonly huidigeLocatie = this.locatieStap.huidigeLocatie;
  readonly kanVolgende = computed(() => this.huidigeLocatie() !== null);
  readonly kaartLocatie = computed(() => {
    const locatie = this.huidigeLocatie();
    if (!locatie) return null;
    return {
      latitude: locatie.latitude,
      longitude: locatie.longitude,
      address: locatie.address
    };
  });

  onLocatieGeselecteerd(locatie: any): void {
    this.locatieStap.selecteerLocatie(locatie);
    this.foutmelding.set(null);
  }

  onLocatieWissen(): void {
    this.locatieStap.verwijderLocation();
    this.foutmelding.set(null);
  }

  onVolgende(): void {
    this.navigatie.volgende();
  }

  onVorige(): void {
    this.navigatie.vorige();
  }

  async onZoeken(zoekTekst: string): Promise<void> {
    this.isZoekenBezig.set(true);
    this.foutmelding.set(null);
    
    try {
      await this.locatieStap.zoekAdres(zoekTekst);
    } catch (error) {
      this.foutmelding.set('Kon geen resultaten vinden voor dit adres');
    } finally {
      this.isZoekenBezig.set(false);
    }
  }


  async onHuidigeLocatie(): Promise<void> {
    if (!navigator.geolocation) {
      this.foutmelding.set('Geolocatie wordt niet ondersteund door deze browser');
      return;
    }

    this.isHuidigeLocatieBezig.set(true);
    this.foutmelding.set(null);
    
    try {
      // Implementeer huidige locatie logica
      // await this.locatieStap.krijgHuidigeLocatie();
    } catch (error) {
      this.foutmelding.set('Kon huidige locatie niet ophalen');
    } finally {
      this.isHuidigeLocatieBezig.set(false);
    }
  }
}