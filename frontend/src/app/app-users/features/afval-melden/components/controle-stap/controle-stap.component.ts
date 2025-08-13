import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent, CardComponent, CardContentComponent, CardFooterComponent, CardHeaderComponent } from '@app/app-users/shared/components/shadcn';
import { ContactInfo } from '../contact-stap/contact-stap.component';
import { MeldingState } from '../../services/melding-state.service';
import { MeldingVerzendService } from '../../services/melding-verzend.service';

@Component({
  selector: 'app-controle-stap',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    CardComponent,
    CardHeaderComponent,
    CardContentComponent,
    CardFooterComponent
  ],
  templateUrl: './controle-stap.component.html'
})
export class ControleStapComponent {
  // Services
  private stateService = inject(MeldingState);
  private meldingVerzendService = inject(MeldingVerzendService);
  
  // State
  fotoUrl = this.stateService.fotoUrl;
  locatieAdres = this.stateService.locatieAdres;
  contactInfo = this.stateService.contactInfo;
  heeftVorigeStap = this.stateService.heeftVorigeStap;
  
  
  /**
   * Controleert of de versturen knop uitgeschakeld moet worden
   */
  isVersturenDisabled(): boolean {
    return !this.fotoUrl() || !this.locatieAdres() || this.stateService.isVerzenden();
  }
  
  /**
   * Handler voor het aanpassen van de melding
   */
  onAanpassen(): void {
    this.stateService.gaTerugNaarStart();
  }
  
  /**
   * Handler voor het versturen van de melding
   */
  onVersturen(): void {
    this.meldingVerzendService.verzendMelding().subscribe({
      next: () => this.stateService.gaNaarVolgende(),
      error: (error: Error) => this.meldingVerzendService.verwerkFout(error)
    });
  }

  /**
   * Handler voor terug naar vorige stap
   */
  onTerug(): void {
    this.stateService.gaTerugNaarVorige();
  }
}