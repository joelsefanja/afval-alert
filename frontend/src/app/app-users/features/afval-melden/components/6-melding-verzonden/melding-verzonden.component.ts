import { Component, inject, computed } from '@angular/core';
import { NavigatieService } from '../../services/navigatie/navigatie.service';
import { SessieStorageService } from '../../services/opslag/sessie-storage.service';
import { MeldingConceptService } from '../../services/melding/concept/melding-concept.service';
import { PwaInstallService } from '../../services/netwerk/pwa-install.service';
import { SuccesBerichtComponent } from './components/succes-bericht/succes-bericht.component';
import { ClassificatieResultaatComponent } from './components/classificatie-resultaat/classificatie-resultaat.component';
import { Toolbar } from 'primeng/toolbar';
import { Avatar } from 'primeng/avatar';
import { Card } from 'primeng/card';

/**
 * Melding verzonden component
 * Succes pagina met classificatie resultaten en PWA installatie
 */
@Component({
  selector: 'app-melding-verzonden',
  standalone: true,
  imports: [SuccesBerichtComponent, ClassificatieResultaatComponent, Toolbar, Avatar, Card],
  templateUrl: './melding-verzonden.component.html',
})
export class MeldingVerzondenComponent {
  // Services
  private readonly navigatie = inject(NavigatieService);
  private readonly sessieStorage = inject(SessieStorageService);
  private readonly conceptService = inject(MeldingConceptService);
  private readonly pwaService = inject(PwaInstallService);

  // Computed data
  readonly meldingId = computed(() => {
    return this.sessieStorage.krijgMeldingId() || this.genereerMockId();
  });
  
  readonly classificatieResultaten = computed(() => {
    const meldingId = this.sessieStorage.krijgMeldingId();
    if (!meldingId) return [];
    const resultaten = this.sessieStorage.krijgClassificatie(meldingId);
    return resultaten || [];
  });
  
  readonly heeftClassificatie = computed(() => this.classificatieResultaten().length > 0);
  readonly kanPWAInstalleren = computed(() => this.pwaService.kanInstalleren());
  
  readonly besteGok = computed(() => {
    const resultaten = this.classificatieResultaten();
    if (!resultaten.length) return null;
    
    return resultaten.reduce((prev, current) => 
      current.confidence > prev.confidence ? current : prev
    );
  });

  async onPWAInstalleren(): Promise<void> {
    try {
      await this.pwaService.promptInstall();
    } catch (error) {
      console.log('PWA installatie geannuleerd');
    }
  }

  onNieuweMelding(): void {
    // Reset alles en ga naar start
    this.sessieStorage.clear();
    this.navigatie.herstart();
  }

  onSluitApplicatie(): void {
    if ('close' in window) {
      window.close();
    } else {
      // Fallback voor browsers die window.close() niet ondersteunen
      this.onNieuweMelding();
    }
  }
  
  private genereerMockId(): string {
    return 'AFV-' + Math.random().toString(36).substr(2, 8).toUpperCase();
  }
}