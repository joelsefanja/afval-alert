import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { MeldingsProcedureStatus, AfvalMeldProcedureStap } from './services/melding/melding-state.service';
import { NetworkService } from './services/core/network.service';
import { 
  StartStapComponent,
  FotoStapComponent, 
  LocatieStapComponent, 
  ContactStapComponent, 
  ControleStapComponent, 
  SuccesStapComponent,
  OfflineNotificatieComponent
} from './components/index';
import { StepsModule } from 'primeng/steps';
import { MenuItem } from 'primeng/api';

export interface Stap {
  id: number;
  titel: string;
  voltooid: boolean;
  actief: boolean;
}

@Component({
  selector: 'app-afval-meld-procedure',
  template: `
    <div class="min-h-screen bg-surface-50 dark:bg-surface-950 flex flex-col">
      <header class="bg-white dark:bg-surface-900 shadow-sm border-b border-surface-200 dark:border-surface-700 px-4 py-3">
        <div class="max-w-7xl mx-auto">
          <div class="flex items-center justify-between">
            <h1 class="text-xl font-semibold text-surface-900 dark:text-surface-100">Afval Alert</h1>
            <div class="flex items-center gap-3">
              @if (!state.isOffline()) {
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span class="text-sm text-surface-600 dark:text-surface-400">Online</span>
                </div>
              } @else {
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span class="text-sm text-surface-600 dark:text-surface-400">Offline</span>
                </div>
              }
            </div>
          </div>
          @if (stappenData().length > 0) {
            <div class="mt-4">
              <p-steps 
                [model]="getMenuItems()" 
                [readonly]="true" 
                [activeIndex]="getActiveIndex()"
                styleClass="w-full"
              ></p-steps>
            </div>
          }
        </div>
      </header>
      
      <main class="flex-grow flex items-center justify-center lg:pt-8">
        <div class="w-full max-w-md lg:max-w-2xl mx-auto">
          <div class="animate-fade-in">
            @switch (state.huidigeStap()) {
              @case (AfvalMeldProcedureStap.START) { <app-start-stap></app-start-stap> }
              @case (AfvalMeldProcedureStap.FOTO) { <app-foto-stap></app-foto-stap> }
              @case (AfvalMeldProcedureStap.LOCATIE) { <app-locatie-stap></app-locatie-stap> }
              @case (AfvalMeldProcedureStap.CONTACT) { <app-contact-stap></app-contact-stap> }
              @case (AfvalMeldProcedureStap.CONTROLE) { <app-controle-stap></app-controle-stap> }
              @case (AfvalMeldProcedureStap.SUCCES) { <app-succes-stap></app-succes-stap> }
            }
          </div>
        </div>
      </main>
      
      <app-offline-notificatie [isOffline]="state.isOffline()"></app-offline-notificatie>
    </div>
  `,
  standalone: true,
  imports: [
    CommonModule,
    StepsModule,
    StartStapComponent,
    FotoStapComponent,
    LocatieStapComponent,
    ContactStapComponent,
    ControleStapComponent,
    SuccesStapComponent,
    OfflineNotificatieComponent
  ]
})
export class AfvalMeldenProcedureComponent implements OnInit {
  protected state = inject(MeldingsProcedureStatus);
  private network = inject(NetworkService);
  protected AfvalMeldProcedureStap = AfvalMeldProcedureStap;
  private sub = new Subscription();
  
  stappenData = computed((): Stap[] => {
    const huidigeStapNummer = this.state.huidigeStap();
    
    // Toon geen stappen voor START stap
    if (huidigeStapNummer === AfvalMeldProcedureStap.START) {
      return [];
    }
    
    return [
      {
        id: 1,
        titel: 'Foto',
        voltooid: huidigeStapNummer > AfvalMeldProcedureStap.FOTO,
        actief: huidigeStapNummer === AfvalMeldProcedureStap.FOTO
      },
      {
        id: 2,
        titel: 'Locatie',
        voltooid: huidigeStapNummer > AfvalMeldProcedureStap.LOCATIE,
        actief: huidigeStapNummer === AfvalMeldProcedureStap.LOCATIE
      },
      {
        id: 3,
        titel: 'Contact',
        voltooid: huidigeStapNummer > AfvalMeldProcedureStap.CONTACT,
        actief: huidigeStapNummer === AfvalMeldProcedureStap.CONTACT
      },
      {
        id: 4,
        titel: 'Controle',
        voltooid: huidigeStapNummer > AfvalMeldProcedureStap.CONTROLE,
        actief: huidigeStapNummer === AfvalMeldProcedureStap.CONTROLE
      }
    ];
  });

  getMenuItems(): MenuItem[] {
    return this.stappenData().map(stap => ({
      label: stap.titel,
      id: stap.id.toString(),
      command: () => {},
      styleClass: stap.voltooid ? 'p-steps-completed' : ''
    }));
  }

  getActiveIndex(): number {
    const actiefIndex = this.stappenData().findIndex(stap => stap.actief);
    return actiefIndex !== -1 ? actiefIndex : 0;
  }
  
  ngOnInit() {
    this.state.resetState();
    this.sub.add(this.network.isOnline$.subscribe(online => this.state.setOfflineStatus(!online)));
  }
}