import { Injectable, computed, inject, Signal } from '@angular/core';
import { MeldingsProcedureStatus, AfvalMeldProcedureStap } from '../melding/melding-state.service';

export interface Stap {
  id: number;
  titel: string;
  voltooid: boolean;
  actief: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class StepManagerService {
  private state = inject(MeldingsProcedureStatus);

  stappenData: Signal<Stap[]> = computed(() => {
    const huidigeStapNummer = this.state.huidigeStap() as AfvalMeldProcedureStap;

    // Toon geen stappen voor START stap
    if (huidigeStapNummer === AfvalMeldProcedureStap.START) {
      return [];
    }

    return []; // TODO: Implement logic to populate stappenData
  });

  getActiveIndex(): number {
    const actiefIndex = this.stappenData().findIndex(stap => stap.actief);
    return actiefIndex !== -1 ? actiefIndex : 0;
  }

  getProgressPercentage(): number {
    const stappenCount = this.stappenData().length;
    if (stappenCount === 0) return 0;

    const activeIndex = this.getActiveIndex();
    return ((activeIndex + 1) / stappenCount) * 100;
  }

  getCurrentStepTitle(): string {
    const activeStap = this.stappenData().find(stap => stap.actief);
    return activeStap?.titel || '';
  }

  next(): void {
    // Basic navigation - implement based on available state methods
    console.log('Next step');
  }

  previous(): void {
    // Basic navigation - implement based on available state methods  
    console.log('Previous step');
  }
}