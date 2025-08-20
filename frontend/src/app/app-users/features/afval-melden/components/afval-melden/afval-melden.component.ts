import { Component, inject } from '@angular/core';
import { CardModule } from 'primeng/card';
import { StepsModule } from 'primeng/steps';
import { NgComponentOutlet } from '@angular/common';
import { ProcesBuilderService } from '@services/proces/navigatie';
import { IntroductieStapComponent } from '@components/1-introductie/introductie-stap.component';
import { FotoUploadComponent } from '@components/2-foto-upload/foto-upload.component';
import { LocatieSelectieComponent } from '@components/3-locatie-selectie/locatie-selectie.component';
import { ContactStapComponent } from '@components/4-contact-gegevens/contact-stap.component';
import { ControleStapComponent } from '@components/5-controle/controle-stap.component';
import { MeldingVerzondenComponent } from '@components/6-melding-verzonden/melding-verzonden.component';

@Component({
  selector: 'app-afval-melden',
  standalone: true,
  imports: [
    CardModule, 
    StepsModule,
    NgComponentOutlet,
  ],
  templateUrl: './afval-melden.component.html',
  styleUrls: []
})
export class AfvalMeldenComponent {
  procesManager: ProcesBuilderService = inject(ProcesBuilderService);

  
}