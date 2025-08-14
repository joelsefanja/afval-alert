import { Component, inject, output, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconRegistry, MatIconModule } from '@angular/material/icon';
import { Kaart } from "./kaart/kaart";
import { HuidigeLocatie } from "./huidige-locatie/huidige-locatie";
import { KaartService } from '../../../services/kaart';

const SEARCH_ICON =
  `
  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
`;

@Component({
  selector: 'app-locatie-picker',
  templateUrl: './locatie-picker.html',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule, Kaart, HuidigeLocatie]
})
export class LocatiePicker {
  private iconRegistry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);
  private kaartService = inject(KaartService);
  @ViewChild(Kaart) kaartComponent!: Kaart;
  
  locationSelected = output<string>();
  locatieGeselecteerd = output<{latitude: number, longitude: number, address: string, wijk?: string, buurt?: string, gemeente?: string}>();

  searchQuery = '';
  selectedAddress = '';

  constructor() {
    this.iconRegistry.addSvgIconLiteral(
      'search',
      this.sanitizer.bypassSecurityTrustHtml(SEARCH_ICON)
    );
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
