import { Injectable, signal, computed } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ProcesStap } from '@interfaces/proces-stap.interface';
import { IntroductieStapComponent } from '@components/1-introductie/introductie-stap.component';
import { FotoUploadComponent } from '@components/2-foto-upload/foto-upload.component';
import { LocatieSelectieComponent } from '@components/3-locatie-selectie/locatie-selectie.component';
import { ContactStapComponent } from '@components/4-contact-gegevens/contact-stap.component';
import { ControleStapComponent } from '@components/5-controle/controle-stap.component';
import { MeldingVerzondenComponent } from '@components/6-melding-verzonden/melding-verzonden.component';

@Injectable({ providedIn: 'root' })
export class ProcesBuilderService {
  private stappen = signal<ProcesStap[]>([]);
  readonly huidigeStap = signal(0);

  constructor() {
    this.addStap({ label: 'Start', component: IntroductieStapComponent, icon: 'pi pi-play' })
      .addStap({ label: 'Foto', component: FotoUploadComponent, icon: 'pi pi-camera' })
      .addStap({ label: 'Locatie', component: LocatieSelectieComponent, icon: 'pi pi-map-marker' })
      .addStap({ label: 'Contact', component: ContactStapComponent, icon: 'pi pi-user' })
      .addStap({ label: 'Controle', component: ControleStapComponent, icon: 'pi pi-check' })
      .addStap({ label: 'Klaar', component: MeldingVerzondenComponent, icon: 'pi pi-check-circle', hideInMenu: true });
  }

  readonly aantalStappen = computed(() => this.stappen().length);
  readonly isEersteStap = computed(() => this.huidigeStap() === 0);
  readonly isLaatsteStap = computed(() => this.huidigeStap() === this.aantalStappen() - 1);
  readonly huidigeStapObject = computed(() => this.stappen()[this.huidigeStap()]);
  readonly menuItems = computed<MenuItem[]>(() =>
    this.stappen().filter(stap => !stap.hideInMenu).map((stap, i) => ({ label: stap.label, icon: stap.icon, disabled: stap.disabled || i > this.huidigeStap() }))
  );

  readonly huidigeMenuIndex = computed(() => {
    const allStappen = this.stappen();
    const hiddenStappenBeforeCurrent = allStappen.slice(0, this.huidigeStap()).filter(s => s.hideInMenu).length;
    return this.huidigeStap() - hiddenStappenBeforeCurrent;
  });

  

  voegStapToe(stap: ProcesStap) { 
    this.stappen.update(list => [...list, stap]); 
    return this;
  }

  addStap(stap: ProcesStap) {
    return this.voegStapToe(stap);
  }

  /** Check of huidige stap verder mag */
  kanVerder(): boolean {
    const stap = this.stappen()[this.huidigeStap()];
    return stap?.validatie?.isGeldig() ?? true;
  }

  volgende() { if (!this.isLaatsteStap() && this.kanVerder()) this.huidigeStap.update(s => s + 1); }
  vorige() { if (!this.isEersteStap()) this.huidigeStap.update(s => s - 1); }
  reset() { this.huidigeStap.set(0); }
  magStapTerug() { return !this.isEersteStap(); }
}
