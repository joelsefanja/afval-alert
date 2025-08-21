import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Succes stap service
 * Handles success step logic and PWA installation
 */
@Injectable({ providedIn: 'root' })
export class SuccesStapService {
  private _kanPWAInstalleren = signal(false);
  private _isGeinstalleerd = signal(false);
  private deferredPrompt: any = null;

  // Public readonly signals
  readonly kanPWAInstalleren = this._kanPWAInstalleren.asReadonly();
  readonly isGeinstalleerd = this._isGeinstalleerd.asReadonly();

  private router: Router;
  constructor() {
    this.router = inject(Router);
    this.checkPWAStatus();
  }

  private checkPWAStatus(): void {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this._isGeinstalleerd.set(true);
    }

    // Listen for PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this._kanPWAInstalleren.set(true);
    });

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      this._isGeinstalleerd.set(true);
      this._kanPWAInstalleren.set(false);
      this.deferredPrompt = null;
    });
  }

  async promptPWAInstallatie(): Promise<void> {
    if (!this.deferredPrompt) {
      return;
    }

    try {
      this.deferredPrompt.prompt();
      const result = await this.deferredPrompt.userChoice;
      
      if (result.outcome === 'accepted') {
        console.log('User accepted PWA installation');
      } else {
        console.log('User dismissed PWA installation');
      }
    } catch (error) {
      console.error('Error prompting PWA installation:', error);
    } finally {
      this.deferredPrompt = null;
      this._kanPWAInstalleren.set(false);
    }
  }

  terugNaarHome(): void {
    this.router.navigate(['/']);
  }

  sluitApplicatie(): void {
    if (window.close) {
      window.close();
    } else {
      // Fallback for browsers that don't allow window.close()
      this.terugNaarHome();
    }
  }

  herstart(): void {
    // Reset application state if needed
    this.router.navigate(['/afval-melden']);
  }
}