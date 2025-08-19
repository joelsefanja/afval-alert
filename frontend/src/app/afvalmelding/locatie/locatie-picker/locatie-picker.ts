import { Component, AfterViewInit, inject, output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Kaart } from '../../../app-users/features/afval-melden/components/locatie-stap/kaart';
import { HuidigeLocatie } from "./huidige-locatie/huidige-locatie";
import { KaartService } from '../../../app-users/features/afval-melden/services/kaart';

@Component({
  selector: 'app-locatie-picker',
  templateUrl: './locatie-picker.html',
  standalone: true,
  imports: [FormsModule, ButtonModule, InputTextModule, Kaart, HuidigeLocatie]
})
export class LocatiePicker implements AfterViewInit {
  private kaartService = inject(KaartService);
  @ViewChild(Kaart) kaartComponent!: Kaart;

  locationSelected = output<string>();
  locatieGeselecteerd = output<{latitude: number, longitude: number, address: string, wijk?: string, buurt?: string, gemeente?: string}>();

  searchQuery = '';
  selectedAddress = '';

  ngAfterViewInit() {
    // The map is now initialized automatically in the Kaart component
    // No need to manually initialize it here
  }

  onInputChange(event: any) {
    this.searchQuery = event.target.value;
  }

  async onAddressSearch() {
    if (this.searchQuery.trim()) {
      await this.kaartService.searchAddress(this.searchQuery);
    }
  }

  onAddressSelected(address: string) {
    this.selectedAddress = address;
    this.searchQuery = address;
    this.locationSelected.emit(address);
  }

  onLocatieGeselecteerd(locatieInfo: {latitude: number, longitude: number, address: string, wijk?: string, buurt?: string, gemeente?: string}) {
    this.locatieGeselecteerd.emit(locatieInfo);
  }

  async onCurrentLocationSelected() {
    this.selectedAddress = '';
    this.searchQuery = '';
    await this.kaartService.getCurrentLocation();
  }
}
