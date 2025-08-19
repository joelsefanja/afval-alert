import { Injectable, inject } from '@angular/core';
import { MeldingStateService } from '../melding/melding-state.service';
import { StepBuilderService } from './step-builder.service';
import { PWAInstallService } from '../core/pwa-install.service';

/**
 * SuccesStapService - Service voor succes stap logica
 * 
 * Verantwoordelijkheden:
 * - Melding reset voor nieuwe melding
 * - PWA installatie promoten
 * - Navigatie naar begin
 * - Cleanup van tijdelijke data
 * 
 * @example
 * ```typescript
 * constructor(private succesService: SuccesStapService) {}
 * 
 * async downloadApp() {
 *   await this.succesService.promptPWAInstall();
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class SuccesStapService {
  private meldingState = inject(MeldingStateService);
  private stepBuilder = inject(StepBuilderService);
  private pwaInstall = inject(PWAInstallService);
  
  readonly canInstallPWA = this.pwaInstall.canInstall;
  readonly isInstalled = this.pwaInstall.isInstalled;

  async promptPWAInstall(): Promise<boolean> {
    const success = await this.pwaInstall.promptInstall();
    if (success) {
      console.log('PWA installatie succesvol');
    }
    return success;
  }

  resetAndStart(): void {
    this.meldingState.reset();
    this.stepBuilder.reset();
    console.log('Nieuwe melding gestart');
  }

  closeApp(): void {
    this.resetAndStart();
  }
}