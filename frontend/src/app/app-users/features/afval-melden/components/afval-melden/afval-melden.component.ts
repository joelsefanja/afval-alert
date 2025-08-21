import { Component, inject } from '@angular/core';
import { CardModule } from 'primeng/card';
import { StepsModule } from 'primeng/steps';
import { ToolbarModule } from 'primeng/toolbar';
import { NgComponentOutlet } from '@angular/common';
import { NavigatieService } from '../../services/navigatie/navigatie.service';
import { IntroductieStapComponent } from '../1-introductie/introductie-stap.component';
import { FotoUploadComponent } from '../2-foto-upload/foto-upload.component';
import { LocatieSelectieComponent } from '../3-locatie-selectie/locatie-selectie.component';
import { ContactStapComponent } from '../4-contact-gegevens/contact-stap.component';
import { ControleStapComponent } from '../5-controle/controle-stap.component';
import { MeldingVerzondenComponent } from '../6-melding-verzonden/melding-verzonden.component';

@Component({
  selector: 'app-afval-melden',
  standalone: true,
  imports: [
    CardModule, 
    StepsModule,
    ToolbarModule,
    NgComponentOutlet,
  ],
  templateUrl: './afval-melden.component.html',
  // Geen styleUrls meer nodig omdat we PrimeNG componenten gebruiken
})
export class AfvalMeldenComponent {
  readonly navigatieService = inject(NavigatieService);

  
}