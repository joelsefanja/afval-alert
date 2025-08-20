import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ProcesBuilderService } from '@services/proces/navigatie';
import { MeldingStateService } from '@services/melding/state/melding-state.service';

@Component({
  selector: 'app-introductie-stap',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './introductie-stap.component.html',
})
export class IntroductieStapComponent {
  private procesManager = inject(ProcesBuilderService);
  private meldingState = inject(MeldingStateService);

  start() {
    this.meldingState.initializeMelding();
    this.procesManager.volgende();
  }
}