import { Component, OnInit, OnDestroy, output } from '@angular/core';
import { KaartService } from '../../../../services/kaart';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-kaart',
  imports: [],
  templateUrl: './kaart.html',
  styleUrl: './kaart.scss'
})
export class Kaart implements OnInit, OnDestroy {
  addressSelected = output<string>();
  private subscription?: Subscription;

  constructor(private kaartService: KaartService) {};

  ngOnInit() {
    this.kaartService.initMap('mapContainer');
    this.subscription = this.kaartService.addressSelected.subscribe(
      (address: string) => this.addressSelected.emit(address)
    )
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
