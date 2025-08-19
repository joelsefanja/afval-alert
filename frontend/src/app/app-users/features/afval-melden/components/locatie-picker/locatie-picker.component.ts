import { Component, inject, output, signal } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { HuidigeLocatieComponent } from './huidige-locatie/huidige-locatie.component';
import { LocatiePickerService, LocatiePickerData } from '../../services/locatie/locatie-picker.service';

@Component({
  selector: 'app-locatie-picker',
  standalone: true,
  imports: [
    InputTextModule,
    ButtonModule,
    MessageModule,
    ProgressSpinnerModule,
    TooltipModule,
    HuidigeLocatieComponent
  ],
  templateUrl: './locatie-picker.component.html'
})
export class LocatiePickerComponent {
  private locatiePickerService: LocatiePickerService = inject(LocatiePickerService);
  
  locationSelected = output<LocatiePickerData>();
  readonly searchQuery = signal('');
  
  readonly isLoading = this.locatiePickerService.isLoading;
  readonly selectedLocation = this.locatiePickerService.selectedLocation;
  readonly error = this.locatiePickerService.error;

  async onSearch() {
    const query = this.searchQuery().trim();
    if (!query) return;
    
    await this.locatiePickerService.searchAddress(query);
    
    const location = this.selectedLocation();
    if (location) {
      this.locationSelected.emit(location);
    }
  }

  onLocationFound(location: LocatiePickerData) {
    this.locatiePickerService.selectLocation(location);
    this.locationSelected.emit(location);
  }

  onLocationError(error: string) {
    this.locatiePickerService.setError(error);
  }

  updateSearchQuery(value: string) {
    this.searchQuery.set(value);
    this.locatiePickerService.clearError();
  }
}