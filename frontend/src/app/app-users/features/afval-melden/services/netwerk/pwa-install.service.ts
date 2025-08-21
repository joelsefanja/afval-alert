import { Injectable } from '@angular/core';

/**
 * PWA Install service
 * Handles PWA installation functionality
 */
@Injectable({ providedIn: 'root' })
export class PwaInstallService {
  private deferredPrompt: any = null;
  
  constructor() {
    // Listen for the beforeinstallprompt event
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later.
        this.deferredPrompt = e;
      });
    }
  }
  
  /**
   * Check if PWA can be installed
   */
  kanInstalleren(): boolean {
    return !!this.deferredPrompt;
  }
  
  /**
   * Prompt user to install the PWA
   */
  async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }
    
    // Show the install prompt
    this.deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await this.deferredPrompt.userChoice;
    
    // Reset the deferred prompt variable, since we can only use it once
    this.deferredPrompt = null;
    
    return outcome === 'accepted';
  }
  
  /**
   * Check if app is installed
   */
  isGeinstalleerd(): boolean {
    if (typeof window === 'undefined') return false;
    
    // Check if the app is running as a standalone app
    return window.matchMedia('(display-mode: standalone)').matches || 
           (window.navigator as any).standalone === true;
  }
}