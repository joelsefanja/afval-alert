import { Component, inject, output, computed } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Locatie } from '@interfaces/locatie.interface';
import { LocatieService } from '../../../../services/locatie/locatie.service';
@Component({
  selector: 'app-huidige-locatie',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './huidige-locatie.component.html'
})
export class HuidigeLocatieComponent {
  private readonly locatieService = inject(LocatieService);

  locationFound = output<Locatie>();
  locationError = output<string>();

  readonly isLoading = computed(() => this.locatieService.isLoading());

  async getCurrentLocation() {
    try {
      const locatie = await this.locatieService.getCurrentLocation();
      this.locationFound.emit(locatie);
    } catch (error: any) {
      this.locationError.emit(error.message || 'Kon huidige locatie niet ophalen');
    }
  }
}