import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MeldingState } from '../../services/melding-state.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-succes-stap',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './succes-stap.component.html'
})
export class SuccesStapComponent {
  private stateService = inject(MeldingState);
  private router = inject(Router);
  
  /**
   * Handler voor het afronden van de melding
   */
  onMeldingAfgerond(): void {
    this.stateService.resetState();
    this.router.navigate(['/']);
  }
}