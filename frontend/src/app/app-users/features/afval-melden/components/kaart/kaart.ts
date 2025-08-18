import { Component, Inject, OnInit, OnDestroy, output, ViewChild, ElementRef } from '@angular/core';
import { KaartService } from '../../services/kaart';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-kaart',
  templateUrl: './kaart.html',
})
export class Kaart implements OnInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;
  
  addressSelected = output<string>();
  locatieGeselecteerd = output<{latitude: number, longitude: number, address: string, wijk?: string, buurt?: string, gemeente?: string}>();
  private subscription?: Subscription;

  constructor(@Inject(KaartService) private kaartService: KaartService) {};

  ngOnInit() {
    // Initialize the map when the component is initialized
    setTimeout(() => {
      if (this.mapContainer) {
        this.kaartService.initializeMap(this.mapContainer.nativeElement);
      }
    }, 100);
    
    this.subscription = this.kaartService.addressSelected.subscribe(
      (address: string) => {
        this.addressSelected.emit(address);
        // For now, we'll emit a simple location object when an address is selected
        // In a more complete implementation, we might get more detailed location info
        this.locatieGeselecteerd.emit({
          latitude: 0, // These would need to be actual coordinates
          longitude: 0,
          address: address
        });
      }
    );
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
