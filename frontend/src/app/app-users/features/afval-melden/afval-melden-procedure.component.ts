import { Component, inject, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { StepsModule } from 'primeng/steps';
import { StepBuilderService } from './services';
import { StartStapComponent } from './components/start-stap/start-stap.component';
import { FotoStapComponent } from './components/foto-stap/foto-stap.component';
import { LocatieStapComponent } from './components/locatie-stap/locatie-stap.component';
import { ContactStapComponent } from './components/contact-stap/contact-stap.component';
import { ControleStapComponent } from './components/controle-stap/controle-stap.component';
import { SuccesStapComponent } from './components/succes-stap/succes-stap.component';

@Component({
  selector: 'app-afval-meld-procedure',
  standalone: true,
  imports: [CardModule, StepsModule, StartStapComponent, FotoStapComponent, LocatieStapComponent, ContactStapComponent, ControleStapComponent, SuccesStapComponent],
  templateUrl: './afval-melden-procedure.component.html'
})
export class AfvalMeldProcedureComponent implements OnInit {
  stepBuilder: StepBuilderService = inject(StepBuilderService);

  ngOnInit() {
    this.stepBuilder
      .addStep({ label: 'Start', component: StartStapComponent, icon: 'pi pi-play' })
      .addStep({ label: 'Foto', component: FotoStapComponent, icon: 'pi pi-camera' })
      .addStep({ label: 'Locatie', component: LocatieStapComponent, icon: 'pi pi-map-marker' })
      .addStep({ label: 'Contact', component: ContactStapComponent, icon: 'pi pi-user' })
      .addStep({ label: 'Controle', component: ControleStapComponent, icon: 'pi pi-check' })
      .addStep({ label: 'Klaar', component: SuccesStapComponent, icon: 'pi pi-check-circle' });
  }
}