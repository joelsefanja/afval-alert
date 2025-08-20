import { Component, inject, output, signal, computed } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { HuidigeLocatieComponent } from '../huidige-locatie/huidige-locatie.component';
import { LocatieService } from '../../../../services/locatie/locatie.service';
import { Locatie } from '@app/app-users/features/afval-melden/interfaces/locatie.interface';

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
  private readonly locatieService = inject(LocatieService);

  locationSelected = output<Locatie>();
  locationError = output<string>();

  readonly searchQuery = signal('');
  readonly searchResults = signal<Locatie[]>([]);
  readonly isLoading = this.locatieService.isLoading;
  readonly error = signal<string | null>(null);
  readonly currentLocatie = this.locatieService.currentLocation;

  readonly hasResults = computed(() => this.searchResults().length > 0);
  readonly canSearch = computed(() => this.searchQuery().trim().length > 0);

  updateSearchQuery(value: string) {
    this.searchQuery.set(value);
    this.error.set(null);
  }

  async onSearch() {
    const query = this.searchQuery().trim();
    if (!query) return;
    
    try {
      const results = await this.locatieService.searchAddress(query);
      this.searchResults.set(results);
    } catch (error: any) {
      this.locationError.emit(error.message || 'Fout bij zoeken naar adres');
    }
  }

  selectLocation(location: Locatie) {
    this.locatieService.setCurrentLocation(location);
    this.locationSelected.emit(location);
  }

  onLocationFound(location: Locatie) {
    this.selectLocation(location);
  }

  onLocationError(error: string) {
    this.error.set(error);
    this.locationError.emit(error);
  }
}