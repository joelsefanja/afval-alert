import { Component, OnInit, OnDestroy, output } from '@angular/core';
import { KaartService } from '../../../../services/kaart';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-kaart',
  imports: [],
  templateUrl: './kaart.html',
})
export class Kaart implements OnInit, OnDestroy {
  addressSelected = output<string>();
  locatieGeselecteerd = output<{latitude: number, longitude: number, address: string, wijk?: string}>();
  private subscription?: Subscription;

  constructor(private kaartService: KaartService) {};

  ngOnInit() {
    this.kaartService.initMap('mapContainer');
    this.subscription = this.kaartService.addressSelected.subscribe(
      (address: string) => {
        this.addressSelected.emit(address);
        // Ook locatie info doorsturen voor gebied logica
        this.extractLocationInfo(address);
      }
    )
  }

  private extractLocationInfo(address: string) {
    // Haal wijk/buurt info uit het adres voor gebied logica
    const addressParts = address.split(',');
    const wijk = this.extractWijk(addressParts);
    
    // Voor nu gebruik mock coordinaten, later kan dit uit de KaartService komen
    this.locatieGeselecteerd.emit({
      latitude: 53.2193835,
      longitude: 6.5665017,
      address: address,
      wijk: wijk
    });
  }

  private extractWijk(addressParts: string[]): string | undefined {
    // Zoek naar wijk/buurt informatie in de adres onderdelen
    for (const part of addressParts) {
      const trimmed = part.trim();
      // Dit kan uitgebreid worden met meer specifieke wijk detectie logica
      if (trimmed.includes('wijk') || trimmed.includes('buurt') || trimmed.length < 30) {
        return trimmed;
      }
    }
    return undefined;
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
