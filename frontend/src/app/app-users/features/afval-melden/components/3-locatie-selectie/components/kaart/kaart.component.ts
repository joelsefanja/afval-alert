import { Component, Input, Output, EventEmitter, AfterViewInit, ViewChild, ElementRef, OnDestroy, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { LocatieService } from '@services/locatie/locatie.service';
import { Locatie } from '@interfaces/locatie.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-kaart',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './kaart.component.html',
})
export class KaartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  private locatieService = inject(LocatieService);
  private subscription?: Subscription;

  @Input() selectedLocation: Locatie | null = null;
  @Output() locationSelected = new EventEmitter<Locatie>();
  @Output() mapClosed = new EventEmitter<void>();
  @Output() addressSelected = new EventEmitter<string>();

  ngAfterViewInit() {
    setTimeout(async () => {
      if (!this.mapContainer) return;

      const container = this.mapContainer.nativeElement;
      let attempts = 0;
      while ((container.clientWidth === 0 || container.clientHeight === 0) && attempts < 10) {
        await new Promise(r => setTimeout(r, 50));
        attempts++;
      }

      if (container.clientWidth === 0 || container.clientHeight === 0) {
        container.style.minHeight = '400px';
      }

      await this.locatieService.initialiseerKaart(container);
      this.probeerHuidigeLocatie();

      setTimeout(() => {
        const kaartService = (this.locatieService as any).kaartService;
        if (kaartService?.kaart3d) kaartService.kaart3d.updateMapSize();
      }, 200);
    }, 150);

    this.subscription = this.locatieService.adresGeselecteerd.subscribe(addr => this.addressSelected.emit(addr));
    this.locatieService.locatieGeselecteerd.subscribe(loc => {
      this.locationSelected.emit({
        latitude: loc.latitude,
        longitude: loc.longitude,
        address: loc.address
      });
    });

    if (this.selectedLocation) {
      setTimeout(() => {
        this.locatieService.setMarker(
          this.selectedLocation!.latitude,
          this.selectedLocation!.longitude,
          this.selectedLocation!.address
        );
      }, 500);
    }
  }

  ngOnDestroy() { this.subscription?.unsubscribe(); this.locatieService.verwijderKaart(); }
  onClose() { this.mapClosed.emit(); }

  private async probeerHuidigeLocatie(): Promise<void> {
    if (!navigator.geolocation) return;

    try {
      if ('permissions' in navigator) {
        const perm = await navigator.permissions.query({ name: 'geolocation' as any });
        if (perm.state === 'granted') this.haalHuidigeLocatieOp();
      } else this.haalHuidigeLocatieOp();
    } catch {}
  }

  private async haalHuidigeLocatieOp(): Promise<void> {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 });
      });
      const { latitude, longitude } = pos.coords;
      this.locatieService.setMarker(latitude, longitude, 'Huidige locatie');

      setTimeout(async () => {
        try {
          const adr = await this.locatieService.getAddressFromCoordinates(latitude, longitude);
          const fullAddress = `${adr.street} ${adr.houseNumber}, ${adr.city}`;
          this.locatieService.setMarker(latitude, longitude, fullAddress);
        } catch {}
      }, 1000);
    } catch {}
  }
}
