import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { PanelModule } from 'primeng/panel';
import { TooltipModule } from 'primeng/tooltip';
import { MeldingsProcedureStatus } from '../../services/melding/melding-state.service';

@Component({
  selector: 'app-controle-stap',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, DividerModule, PanelModule, TooltipModule],
  templateUrl: './controle-stap.component.html',
  styleUrls: ['./controle-stap.component.scss']
})
export class ControleStapComponent {
  protected state = inject(MeldingsProcedureStatus);

  terug() { 
    this.state.gaTerugNaarVorige(); 
  }
  
  verzendMelding() {
    this.state.setHuidigeStap(6); // Ga naar verzend stap
  }

  wijzigFoto() {
    this.state.setHuidigeStap(1); // Terug naar foto stap
  }

  wijzigLocatie() {
    this.state.setHuidigeStap(3); // Terug naar locatie stap
  }

  wijzigContact() {
    this.state.setHuidigeStap(4); // Terug naar contact stap
  }
}