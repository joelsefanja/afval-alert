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
  locatieGeselecteerd = output<{latitude: number, longitude: number, address: string, wijk?: string, buurt?: string, gemeente?: string}>();
  private addressSubscription?: Subscription;
  private gebiedSubscription?: Subscription;

  constructor(private kaartService: KaartService) {};

  ngOnInit() {
    this.kaartService.initMap('mapContainer');
    
    this.addressSubscription = this.kaartService.addressSelected.subscribe(
      (address: string) => {
        this.addressSelected.emit(address);
      }
    );

    this.gebiedSubscription = this.kaartService.gebiedSelected.subscribe(
      (gebiedInfo) => {
        this.locatieGeselecteerd.emit({
          latitude: gebiedInfo.coordinate.lat,
          longitude: gebiedInfo.coordinate.lng,
          address: '', // Address wordt apart verstuurd via addressSelected
          wijk: gebiedInfo.wijk,
          buurt: gebiedInfo.buurt,
          gemeente: gebiedInfo.gemeente
        });
      }
    );
  }

  ngOnDestroy() {
    this.addressSubscription?.unsubscribe();
    this.gebiedSubscription?.unsubscribe();
  }
}
