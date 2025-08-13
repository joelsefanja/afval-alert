import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent, CardComponent, CardContentComponent, CardFooterComponent, CardHeaderComponent } from '@app/app-users/shared/components/shadcn';
import { LocatieService } from '../../services/locatie.service';
import { MeldingState } from '../../services/melding-state.service';
import { Locatie } from '@app/models';
import { LocatiePicker } from '@app/afvalmelding/locatie/locatie-picker/locatie-picker';

@Component({
  selector: 'app-locatie-stap',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    CardComponent,
    CardHeaderComponent,
    CardContentComponent,
    CardFooterComponent,
    LocatiePicker
  ],
  templateUrl: './locatie-stap.component.html'
})
export class LocatieStapComponent {
  private locatieService = inject(LocatieService);
  private stateService = inject(MeldingState);
  
  locatieAdres = this.stateService.locatieAdres;
  locatieBuitenGroningen = this.stateService.locatieBuitenGroningen;
  errorMessage = this.stateService.locatieError;
  heeftVorigeStap = this.stateService.heeftVorigeStap;
  
  
  /**
   * Handler voor het selecteren van een locatie
   * @param locatie De geselecteerde locatie
   */
  onLocatieGeselecteerd(locatie: { latitude: number, longitude: number }): void {
    const locatieModel: Locatie = {
      latitude: locatie.latitude,
      longitude: locatie.longitude
    };
    this.locatieService.verwerkLocatie(locatieModel);
  }
  
  /**
   * Handler voor het doorgaan naar de volgende stap
   */
  onVolgende(): void {
    this.stateService.gaNaarVolgende();
  }

  /**
   * Handler voor terug naar vorige stap
   */
  onTerug(): void {
    this.stateService.gaTerugNaarVorige();
  }
}