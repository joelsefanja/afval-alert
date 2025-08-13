import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { MeldingState, AfvalMeldProcedureStap } from './services/melding-state.service';
import { NetworkService } from './services/network.service';

import { 
  StartStapComponent,
  FotoStapComponent, 
  LocatieStapComponent, 
  ContactStapComponent, 
  ControleStapComponent, 
  SuccesStapComponent 
} from './components/index';
import { OfflineNotificatieComponent } from './components/offline-notificatie/offline-notificatie.component';

@Component({
  selector: 'app-afval-meld-procedure',
  standalone: true,
  imports: [
    CommonModule,
    StartStapComponent,
    FotoStapComponent,
    LocatieStapComponent,
    ContactStapComponent,
    ControleStapComponent,
    SuccesStapComponent,
    OfflineNotificatieComponent
  ],
  template: `
    <div class="container mx-auto px-4 py-6 max-w-2xl">
      @switch (meldingState.currentStep()) {
        @case (AfvalMeldProcedureStap.START) {
          <app-start-stap></app-start-stap>
        }
        @case (AfvalMeldProcedureStap.FOTO) {
          <app-foto-stap></app-foto-stap>
        }
        @case (AfvalMeldProcedureStap.LOCATIE) {
          <app-locatie-stap></app-locatie-stap>
        }
        @case (AfvalMeldProcedureStap.CONTACT) {
          <app-contact-stap></app-contact-stap>
        }
        @case (AfvalMeldProcedureStap.CONTROLE) {
          <app-controle-stap></app-controle-stap>
        }
        @case (AfvalMeldProcedureStap.SUCCES) {
          <app-succes-stap></app-succes-stap>
        }
      }
      
      <app-offline-notificatie [isOffline]="meldingState.isOffline()"></app-offline-notificatie>
    </div>
  `
})
export class AfvalMeldenProcedureComponent implements OnInit {
  protected meldingState = inject(MeldingState);
  private networkService = inject(NetworkService);
  
  protected AfvalMeldProcedureStap = AfvalMeldProcedureStap;
  
  private subscriptions = new Subscription();
  
  ngOnInit(): void {
    this.meldingState.resetState();
    
    this.subscriptions.add(
      this.networkService.isOnline$.subscribe(isOnline => {
        this.meldingState.setOfflineStatus(!isOnline);
      })
    );
  }
}