import { Component, inject, computed } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { SuccesStapService } from '@services/proces/stappen';
import { AfvalMeldingStateService } from '@services/melding';
import { MediaService } from '../../services';
@Component({
  selector: 'app-melding-verzonden',
  standalone: true,
  imports: [ButtonModule, CardModule, TagModule],
  templateUrl: './melding-verzonden.component.html'
})
export class MeldingVerzondenComponent {
  private succesService: SuccesStapService = inject(SuccesStapService);
  private afvalMeldingService: AfvalMeldingStateService = inject(AfvalMeldingStateService);
  private mediaService: MediaService = inject(MediaService);

  readonly kanPWAInstalleren = this.succesService.kanPWAInstalleren;
  readonly isGeinstalleerd = this.succesService.isGeinstalleerd;
  
  readonly gedetecteerdeAfvalTypes = computed(() => {
    const classificatieResultaat = this.mediaService.classificatieResultaat();
    if (classificatieResultaat?.afval_typen) {
      return classificatieResultaat.afval_typen.map((type: any) => ({
        type: type.afval_type,
        confidence: type.confidence
      }));
    }
    return [];
  });
  
  readonly meldingId = computed(() => {
    const melding = this.afvalMeldingService.afvalMeldingConcept();
    // Return concept ID if available
    return melding.conceptId || 'AFV-' + Math.random().toString(36).substr(2, 8).toUpperCase();
  });

  async downloadApp() {
    await this.succesService.promptPWAInstallatie();
  }

  nieuweMelding() {
    this.succesService.terugNaarHome();
  }

  sluitApplicatie() {
    this.succesService.sluitApplicatie();
  }
}