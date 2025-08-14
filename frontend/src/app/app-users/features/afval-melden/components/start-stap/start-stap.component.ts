import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MeldingsProcedureStatus } from '../../services/melding/melding-state.service';

@Component({
  selector: 'app-start-stap',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule],
  templateUrl: './start-stap.component.html',
  styleUrls: ['./start-stap.component.scss']
})
export class StartStapComponent {
  private state = inject(MeldingsProcedureStatus);
  
  start() {
    this.state.gaNaarVolgende();
  }
}