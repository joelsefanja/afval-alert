import { Injectable, signal } from '@angular/core';

/**
 * Intro stap service
 * Beheert state voor introductie stap
 */
@Injectable({ providedIn: 'root' })
export class IntroStapService {
  // State
  private readonly _gestart = signal(false);
  private readonly _welkomstGezien = signal(false);
  
  // Public readonly signals
  readonly gestart = this._gestart.asReadonly();
  readonly welkomstGezien = this._welkomstGezien.asReadonly();
  
  startMelding(): void {
    this._gestart.set(true);
    this._welkomstGezien.set(true);
  }
  
  reset(): void {
    this._gestart.set(false);
    this._welkomstGezien.set(false);
  }
  
  kanDoorgaan(): boolean {
    return this._gestart();
  }
}