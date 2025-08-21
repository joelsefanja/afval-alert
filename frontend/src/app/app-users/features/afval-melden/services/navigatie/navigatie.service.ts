import { Injectable, signal, computed, inject } from '@angular/core';
import { MeldingValidatieService } from '../melding/validatie/melding-validatie.service';
import { IntroductieStapComponent } from '../../components/1-introductie/introductie-stap.component';
import { FotoUploadComponent } from '../../components/2-foto-upload/foto-upload.component';
import { LocatieSelectieComponent } from '../../components/3-locatie-selectie/locatie-selectie.component';
import { ContactStapComponent } from '../../components/4-contact-gegevens/contact-stap.component';
import { ControleStapComponent } from '../../components/5-controle/controle-stap.component';
import { MeldingVerzondenComponent } from '../../components/6-melding-verzonden/melding-verzonden.component';

/**
 * Clean navigatie service met Nederlandse interface
 * Handelt alle stap-navigatie af met validatie
 */
@Injectable({ providedIn: 'root' })
export class NavigatieService {
  private readonly validatie = inject(MeldingValidatieService);
  
  private readonly _huidigeStap = signal(0);
  private readonly _totaalAantalStappen = signal(6);
  
  // Read-only computed properties
  readonly huidigeStapIndex = this._huidigeStap.asReadonly();
  readonly totaalAantalStappen = this._totaalAantalStappen.asReadonly();

  private readonly stappen = [
    { component: IntroductieStapComponent },
    { component: FotoUploadComponent },
    { component: LocatieSelectieComponent },
    { component: ContactStapComponent },
    { component: ControleStapComponent },
    { component: MeldingVerzondenComponent }
  ];

  readonly huidigeStap = computed(() => {
    const stap = this.stappen[this._huidigeStap()];
    console.log('Huidige stap index:', this._huidigeStap(), 'Component:', stap.component);
    return stap;
  });
  readonly isEersteStap = computed(() => this._huidigeStap() === 0);
  readonly isLaatsteStap = computed(() => this._huidigeStap() >= this._totaalAantalStappen() - 1);
  readonly voortgang = computed(() => (this._huidigeStap() + 1) / this._totaalAantalStappen() * 100);
  readonly menuItems = computed(() => [
    'Introductie',
    'Foto maken',
    'Locatie kiezen',
    'Contactgegevens',
    'Controleren',
    'Verzonden'
  ].map(label => ({ label: label })));
  readonly huidigeMenuIndex = computed(() => this._huidigeStap());
  
  // Validatie per stap
  readonly kanVerder = computed(() => {
    const stapIndex = this._huidigeStap();
    switch (stapIndex) {
      case 0: return true; // Intro stap
      case 1: return this.validatie.heeftGeldigeFoto();
      case 2: return this.validatie.heeftGeldigeLocatie();
      case 3: return true; // Contact is optioneel
      case 4: return this.validatie.kanVerzenden();
      default: return false;
    }
  });
  
  readonly kanTerug = computed(() => !this.isEersteStap());
  
  // Public interface - Nederlands
  volgende(): boolean {
    if (!this.kanVerder() || this.isLaatsteStap()) return false;
    this._huidigeStap.update(index => index + 1);
    return true;
  }
  
  vorige(): boolean {
    if (this.isEersteStap()) return false;
    this._huidigeStap.update(index => index - 1);
    return true;
  }
  
  gaNaarStap(stapIndex: number): boolean {
    if (stapIndex < 0 || stapIndex >= this._totaalAantalStappen()) return false;
    if (stapIndex > this._huidigeStap() && !this.kanVerder()) return false;
    
    this._huidigeStap.set(stapIndex);
    return true;
  }
  
  herstart(): void {
    this._huidigeStap.set(0);
  }
  
  gaNaarLaatsteStap(): void {
    this._huidigeStap.set(this._totaalAantalStappen() - 1);
  }
  
  // Utility methods
  krijgStapNaam(index?: number): string {
    const stapIndex = index ?? this._huidigeStap();
    const stapNamen = [
      'Introductie',
      'Foto maken', 
      'Locatie kiezen',
      'Contactgegevens',
      'Controleren',
      'Verzonden'
    ];
    return stapNamen[stapIndex] || 'Onbekend';
  }
  
  krijgStapIcon(index?: number): string {
    const stapIndex = index ?? this._huidigeStap();
    const icons = [
      'pi-home',
      'pi-camera',
      'pi-map-marker', 
      'pi-user',
      'pi-check',
      'pi-check-circle'
    ];
    return icons[stapIndex] || 'pi-circle';
  }
}