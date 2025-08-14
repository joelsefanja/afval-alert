import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MeldingsProcedureStatus } from '../../services/melding/melding-state.service';

@Component({
  selector: 'app-succes-stap',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule],
  templateUrl: './succes-stap.component.html',
  styleUrls: ['./succes-stap.component.scss']
})
export class SuccesStapComponent {
  protected state = inject(MeldingsProcedureStatus);

  nieuweMelding() {
    this.state.resetState();
  }

  sluitApp() {
    // In een echte app zou dit de app sluiten of naar home navigeren
    window.close();
  }
}