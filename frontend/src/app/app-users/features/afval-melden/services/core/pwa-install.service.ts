import { Injectable, signal } from '@angular/core';

/**
 * Progressive web app (PWA) installatie service
 * 
 * Verantwoordelijkheden:
 * - PWA installatie prompt beheer
 * - Browser compatibility check
 * - Install event handling
 * - User engagement tracking
 * 
 * @example
 * ```typescript
 * constructor(private pwaService: PWAInstallService) {}
 * 
 * async installApp() {
 *   if (this.pwaService.canInstall()) {
 *     await this.pwaService.promptInstall();
 *   }
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class PWAInstallService {
  private deferredPrompt: any = null;
  
  readonly canInstall = signal(false);
  readonly isInstalled = signal(false);

  constructor() {
    this.setupEventListeners();
    this.checkIfInstalled();
  }

  private setupEventListeners(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.canInstall.set(true);
    });

    window.addEventListener('appinstalled', () => {
      this.isInstalled.set(true);
      this.canInstall.set(false);
      this.deferredPrompt = null;
    });
  }

  async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) return false;

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      this.deferredPrompt = null;
      this.canInstall.set(false);
      return true;
    }
    
    return false;
  }

  private checkIfInstalled(): void {
    // Check if app is in standalone mode (installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    
    this.isInstalled.set(isStandalone || isInWebAppiOS);
  }
}