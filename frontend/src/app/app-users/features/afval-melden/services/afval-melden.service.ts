import { Injectable, signal, computed, inject } from '@angular/core';
import { NetworkService } from './netwerk/network.service';
import { Subscription } from 'rxjs';
import { ProcesBuilderService } from './proces/navigatie/proces-builder.service';

export interface Stap {
  id: number;
  titel: string;
  voltooid: boolean;
  actief: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AfvalMeldenService {
  private procesBuilder = inject(ProcesBuilderService);
  private network = inject(NetworkService);
  private sub = new Subscription();
  isOffline = signal(false);

  stappenData = computed((): Stap[] => {
    // Toon geen stappen voor START stap
    if (this.procesBuilder.huidigeStap() === 0) {
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
    this.procesBuilder.reset();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}