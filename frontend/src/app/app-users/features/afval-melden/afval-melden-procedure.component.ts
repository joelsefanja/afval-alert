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
import { ProgressBarModule } from 'primeng/progressbar';
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
    <div class="h-screen bg-green-50 flex flex-col">
      
      <!-- Progress Header - alleen tonen tijdens stappen -->
      @if (stappenData().length > 0) {
        <div class="bg-white dark:bg-surface-900 shadow-sm border-b border-surface-200 dark:border-surface-700 px-4 py-4">
          <div class="max-w-4xl mx-auto">
            <!-- Modern Step Progress Indicator -->
            <div class="mb-4">
              <div class="flex items-center justify-between mb-2">
                <h2 class="text-xl font-bold text-surface-900 dark:text-surface-100 slide-in-right-animation">
                  {{ getCurrentStepTitle() }}
                </h2>
                <span class="text-sm font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                  Stap {{ getActiveIndex() + 1 }} van {{ stappenData().length }}
                </span>
              </div>
              
              <!-- Animated Progress Bar -->
              <div class="relative pt-1">
                <div class="flex items-center justify-between mb-1">
                  <div class="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-2.5">
                    <div 
                      class="bg-gradient-to-r from-primary-500 to-green-500 h-2.5 rounded-full step-progress-bar"
                      [style.width.%]="getProgressPercentage()"
                      [class.progress-fill-animation]="true">
                    </div>
                  </div>
                </div>
                
                <!-- Step Labels with Animation -->
                <div class="flex justify-between mt-3 relative">
                  @for (stap of stappenData(); track stap.id) {
                    <div class="flex flex-col items-center relative">
                      <!-- Step Circle with Animation -->
                      <div 
                        class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 step-circle"
                        [class]="getStepCircleClass(stap)">
                        @if (stap.voltooid) {
                          <i class="pi pi-check text-white animate-fade-in"></i>
                        } @else if (stap.actief) {
                          <span class="text-white">{{ stap.id }}</span>
                        } @else {
                          <span class="text-surface-400 dark:text-surface-500">{{ stap.id }}</span>
                        }
                      </div>
                      <!-- Step Label -->
                      <span 
                        class="text-xs mt-1 font-medium transition-colors duration-300 step-label"
                        [class]="getStepLabelClass(stap)">
                        {{ stap.titel }}
                      </span>
                    </div>
                  }
                </div>
              </div>
            </div>
            
            <!-- Connection Lines Between Steps -->
            <div class="flex justify-between relative px-4 -mt-1 mb-2">
              @for (stap of stappenData(); track $index; let i = $index) {
                @if (i < stappenData().length - 1) {
                  <div 
                    class="absolute top-4 h-0.5 -translate-y-1/2 transition-all duration-500"
                    [style.left.%]="(i * (100 / (stappenData().length - 1))) + (25 / stappenData().length)"
                    [style.width.%]="(50 / (stappenData().length - 1))"
                    [class]="getConnectionLineColor(stap)">
                  </div>
                }
              }
            </div>
          </div>
        </div>
      }
      
      <!-- Main Content -->
      <main class="flex-1 flex">
        <div class="w-full flex items-center justify-center">
          <div class="w-full max-w-md mx-auto h-[70vh] flex flex-col motion-preset-slide-up">
            @switch (state.huidigeStap()) {
              @case (AfvalMeldProcedureStap.START) { <app-start-stap></app-start-stap> }
              @case (AfvalMeldProcedureStap.FOTO) { <app-foto-stap></app-foto-stap> }
              @case (AfvalMeldProcedureStap.LOCATIE) { <app-locatie-stap titel="Locatie" subtitel="Geef aan waar het afval ligt"></app-locatie-stap> }
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
    ProgressBarModule,
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

  protected getProgressPercentage(): number {
    const stappenCount = this.stappenData().length;
    if (stappenCount === 0) return 0;
    
    const activeIndex = this.getActiveIndex();
    return ((activeIndex + 1) / stappenCount) * 100;
  }

  protected getCurrentStepTitle(): string {
    const activeStap = this.stappenData().find(stap => stap.actief);
    return activeStap?.titel || '';
  }
  
  // Helper methods for styling
  protected getStepCircleClass(stap: Stap): string {
    if (stap.voltooid) {
      return 'bg-green-500 border-2 border-green-500 shadow-lg shadow-green-500/30';
    } else if (stap.actief) {
      return 'bg-primary-500 border-2 border-primary-500 shadow-lg shadow-primary-500/30 step-circle-active bounce-smooth-animation';
    } else {
      return 'bg-white border-2 border-surface-300 dark:border-surface-600';
    }
  }
  
  protected getStepLabelClass(stap: Stap): string {
    if (stap.voltooid) {
      return 'text-green-600 dark:text-green-400';
    } else if (stap.actief) {
      return 'text-primary-600 dark:text-primary-400 font-semibold';
    } else {
      return 'text-surface-500 dark:text-surface-400';
    }
  }
  
  protected getConnectionLineColor(stap: Stap): string {
    if (stap.voltooid) {
      return 'bg-green-500';
    } else {
      return 'bg-surface-200 dark:bg-surface-700';
    }
  }
  
  ngOnInit() {
    this.state.resetState();
    this.sub.add(this.network.isOnline$.subscribe(online => this.state.setOfflineStatus(!online)));
  }
}