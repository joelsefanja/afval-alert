import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BaseStapComponent } from '../base-stap.component';
import { LocatiePicker } from '../../../../../afvalmelding/locatie/locatie-picker/locatie-picker';
import { LocatieFacadeService, LocatieInfo, LocatieState } from '../../services/locatie/locatie-facade.service';

/**
 * Presentational component voor locatie selectie.
 * Alle business logica is verplaatst naar LocatieFacadeService.
 */
@Component({
  selector: 'app-locatie-stap',
  templateUrl: './locatie-stap.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    LocatiePicker
  ]
})
export class LocatieStapComponent extends BaseStapComponent implements OnInit, OnDestroy {
  private readonly locatieFacade = inject(LocatieFacadeService);
  
  // Form control for search
  readonly zoekQuery = new FormControl('');
  
  // Facade state
  protected readonly locatieState = this.locatieFacade.locatieState;

  ngOnInit(): void {
    this.setupSearchControl();
  }

  ngOnDestroy(): void {
    this.locatieFacade.destroy();
  }

  // Template getters for backward compatibility
  get geselecteerdAdres() {
    return this.locatieState().selectedAddress;
  }

  get isLoading() {
    return this.locatieState().isLoading;
  }

  get foutmelding() {
    return this.locatieState().errorMessage;
  }

  get magDoorgaan() {
    return this.locatieState().canProceed;
  }

  // Template methods
  protected gpsBezig(): boolean {
    return this.locatieState().isLoading;
  }

  protected disabled(): boolean {
    return false;
  }

  protected adresZoekenBezig(): boolean {
    return this.locatieState().isLoading;
  }

  protected async getCurrentLocation(): Promise<void> {
    try {
      await this.locatieFacade.getCurrentLocation();
    } catch (error) {
      // Error handled by facade
    }
  }

  protected async onAddressSearch(): Promise<void> {
    const query = this.zoekQuery.value;
    if (!query) return;
    
    try {
      await this.locatieFacade.searchAddress(query);
    } catch (error) {
      // Error handled by facade
    }
  }

  protected async onKaartLocatieGeselecteerd(locatieInfo: LocatieInfo): Promise<void> {
    try {
      await this.locatieFacade.selectMapLocation(locatieInfo);
    } catch (error) {
      // Error handled by facade
    }
  }

  protected onLocationSelected(location: any): void {
    // Handle location selection from map
    if (location && location.latitude && location.longitude) {
      const locatieInfo: LocatieInfo = {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address || 'Geselecteerde locatie'
      };
      this.onKaartLocatieGeselecteerd(locatieInfo);
    }
  }

  private setupSearchControl(): void {
    this.locatieFacade.setupSearchControl(this.zoekQuery).subscribe(query => {
      if (query && query.length > 3) {
        console.log('Zoeken naar:', query);
      }
    });
  }
}