import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent, CardComponent, CardContentComponent, CardFooterComponent, CardHeaderComponent } from '@app/app-users/shared/components/shadcn';
import { FotoService } from '../../services/foto.service';
import { MeldingState } from '../../services/melding-state.service';

@Component({
  selector: 'app-foto-stap',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    CardComponent,
    CardHeaderComponent,
    CardContentComponent,
    CardFooterComponent
  ],
  templateUrl: './foto-stap.component.html'
})
export class FotoStapComponent {
  private fotoService = inject(FotoService);
  private stateService = inject(MeldingState);
  
  fotoUrl = this.stateService.fotoUrl;
  errorMessage = this.stateService.fotoError;
  heeftVorigeStap = this.stateService.heeftVorigeStap;
  
  /**
   * Handler voor het maken van een foto
   */
  async onMaakFoto(): Promise<void> {
    try {
      this.stateService.setFotoError('');
      const fotoBlob = await this.fotoService.maakFoto();
      const fotoUrl = await this.fotoService.blobToDataUrl(fotoBlob);
      this.stateService.setFotoUrl(fotoUrl);
    } catch (error) {
      this.stateService.setFotoError(
        'Camera toegang geweigerd of niet beschikbaar. Probeer opnieuw of kies een foto uit de galerij.'
      );
    }
  }
  
  /**
   * Handler voor het kiezen van een foto uit de galerij
   */
  async onKiesFoto(): Promise<void> {
    try {
      this.stateService.setFotoError('');
      const fotoBlob = await this.fotoService.kiesFotoUitGalerij();
      const fotoUrl = await this.fotoService.blobToDataUrl(fotoBlob);
      this.stateService.setFotoUrl(fotoUrl);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Fout bij kiezen foto';
      this.stateService.setFotoError(errorMessage);
    }
  }
  
  /**
   * Handler voor het verwijderen van de geselecteerde foto
   */
  onVerwijderFoto(): void {
    this.stateService.setFotoUrl('');
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