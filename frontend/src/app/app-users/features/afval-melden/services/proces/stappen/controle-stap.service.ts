import { Injectable, inject, computed } from '@angular/core';
import { ProcesStapValidatie } from '@interfaces/proces-stap-validatie.interface';
import { MeldingStateService } from '../../melding/state/melding-state.service';
import { ProcesNavigatorService } from '../navigatie/proces-navigator.service';
import { MeldingVerzendService } from '../../melding/verzending/melding-verzend.service';

@Injectable({ providedIn: 'root' })
export class ControleStapService implements ProcesStapValidatie {
  private meldingStateService = inject(MeldingStateService);
  private navigator = inject(ProcesNavigatorService);
  private verzendService = inject(MeldingVerzendService);

  readonly overzicht = computed(() => {
    const gegevens = this.meldingStateService.meldingData();
    return {
      uuid: this.meldingStateService.getMeldingUuid(),
      locatie: gegevens.locatie,
      contact: gegevens.contact,
      afbeeldingUrl: gegevens.afbeeldingUrl,
      afvalTypes: gegevens.afvalTypes || []
    };
  });

  readonly isComplete = computed(() => {
    const gegevens = this.meldingStateService.meldingData();
    const uuid = this.meldingStateService.getMeldingUuid();
    return !!(uuid && gegevens.locatie?.latitude && gegevens.locatie?.longitude);
  });

  readonly isGeldigFormulier = computed(() => this.isComplete());

  isGeldig(): boolean { return this.isGeldigFormulier(); }

  prev(): void {
    this.navigator.vorige();
  }

  async submit(): Promise<void> {
    if (this.isComplete()) {
      try {
        await this.verzendService.verzendMelding().toPromise();
        this.navigator.volgende();
      } catch (error) {
        console.error('Fout bij verzenden:', error);
      }
    }
  }

  editFoto(): void {
    this.navigator.gaNaar(1);
  }

  editLocatie(): void {
    this.navigator.gaNaar(2);
  }

  editContact(): void {
    this.navigator.gaNaar(3);
  }

  opslaan(): void {
    // Nothing to save in the review step
  }
}
