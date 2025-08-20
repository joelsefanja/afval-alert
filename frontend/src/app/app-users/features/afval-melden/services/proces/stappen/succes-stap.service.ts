import { Injectable, inject } from '@angular/core';
import { AfvalMeldingStateService } from '@services/melding';
import { ProcesBuilderService } from '../navigatie/proces-builder.service';
import { PWAInstallService } from '../../netwerk/pwa-install.service';

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
 *   await this.succesService.promptPWAInstallatie();
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class SuccesStapService {
  private afvalMeldingService = inject(AfvalMeldingStateService);
  private procesManager = inject(ProcesBuilderService);
  private pwaInstall = inject(PWAInstallService);
  
  readonly kanPWAInstalleren = this.pwaInstall.kanInstalleren;
  readonly isGeinstalleerd = this.pwaInstall.isGeinstaleerd;

  async promptPWAInstallatie(): Promise<boolean> {
    const succes = await this.pwaInstall.promptVoorInstallatie();
    if (succes) {
      console.log('PWA installatie succesvol');
    }
    return succes;
  }

  terugNaarHome(): void {
    this.afvalMeldingService.herstelBeginwaarden();
    this.procesManager.reset();
    console.log('Nieuwe melding gestart');
  }

  sluitApplicatie(): void {
    this.terugNaarHome();
  }
}