import { Component, inject, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { LocatiePickerData, LocatiePickerService } from '../../../services/locatie/locatie-picker.service';

@Component({
  selector: 'app-huidige-locatie',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './huidige-locatie.component.html'
})
export class HuidigeLocatieComponent {
  private locatiePickerService = inject(LocatiePickerService);

  locationFound = output<LocatiePickerData>();
  locationError = output<string>();

  readonly isLoading = this.locatiePickerService.isLoading;
  readonly error = this.locatiePickerService.error;

  async onGetCurrentLocation() {
    const location = await this.locatiePickerService.getCurrentLocation();

    if (location) {
      this.locationFound.emit(location);
    } else {
      const errorMsg = this.locatiePickerService.error() || 'Kon huidige locatie niet ophalen';
      this.locationError.emit(errorMsg);
    }
  }
}