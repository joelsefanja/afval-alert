import { Injectable, signal, computed, inject } from '@angular/core';
import { MeldingsProcedureStatus, AfvalMeldProcedureStap } from './services/melding/melding-state.service';
import { NetworkService } from './services/core/network.service';
import { Subscription } from 'rxjs';

export interface Stap {
  id: number;
  titel: string;
  voltooid: boolean;
  actief: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AfvalMeldenProcedureService {
  private state = inject(MeldingsProcedureStatus);
  private network = inject(NetworkService);
  private sub = new Subscription();
  isOffline = signal(false);

  stappenData = computed((): Stap[] => {
    const huidigeStapNummer = this.state.huidigeStap();

    // Toon geen stappen voor START stap
    if (huidigeStapNummer === AfvalMeldProcedureStap.START) {
      return [];
    }

    return [];
  });

  constructor() {
    this.sub.add(this.network.isOnline$.subscribe(online => this.isOffline.set(!online)));
  }

  getActieveIndex(): number {
    const actiefIndex = this.stappenData().findIndex(stap => stap.actief);
    return actiefIndex !== -1 ? actiefIndex : 0;
  }

  getProgressPercentage(): number {
    const stappenCount = this.stappenData().length;
    if (stappenCount === 0) return 0;

    const activeIndex = this.getActieveIndex();
    return ((activeIndex + 1) / stappenCount) * 100;
  }

  getCurrentStepTitle(): string {
    const activeStap = this.stappenData().find(stap => stap.actief);
    return activeStap?.titel || '';
  }

  resetState(): void {
    this.state.resetState();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}