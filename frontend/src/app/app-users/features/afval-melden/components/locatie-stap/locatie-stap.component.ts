import { Component, inject, signal } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { StepBuilderService } from '../../services/steps/step-builder.service';
import { LocatieStapService } from '../../services/locatie/locatie-stap.service';
import { LocatiePickerComponent } from '../locatie-picker/locatie-picker.component';
import { KaartComponent } from './kaart/kaart.component';
import { LocatiePickerData } from '../../services/locatie/locatie-picker.service';

@Component({
  selector: 'app-locatie-stap',
  standalone: true,
  imports: [
    CardModule, 
    ButtonModule, 
    MessageModule, 
    ProgressSpinnerModule,
    LocatiePickerComponent,
    KaartComponent
  ],
  templateUrl: './locatie-stap.component.html'
})
export class LocatieStapComponent {
  private stepBuilder = inject(StepBuilderService) as any;
  private locatieService = inject(LocatieStapService);

  readonly huidigeLocatie = this.locatieService.huidigeLocatie;
  readonly error = this.locatieService.error;
  readonly isLoading = this.locatieService.isLoading;
  readonly showMap = signal(false);
  foutmelding: string = '';

  onLocationSelected(location: LocatiePickerData) {
    this.locatieService.setLocatie(location);
  }

  getSelectedLocationForMap() {
    const loc = this.huidigeLocatie();
    if (!loc) return null;
    
    return {
      latitude: loc.lat,
      longitude: loc.lng,
      address: loc.address
    };
  }

  onKaartOpenen() {
    this.showMap.set(true);
  }

  onKaartSluiten() {
    this.showMap.set(false);
  }

  onVolgende() {
    if (this.huidigeLocatie()) {
      this.stepBuilder.next();
    }
  }

  onVorige() {
    this.stepBuilder.prev();
  }
}