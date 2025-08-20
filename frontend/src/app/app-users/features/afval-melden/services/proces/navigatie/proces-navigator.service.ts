import { Injectable, inject, computed } from '@angular/core';
import { ProcesBuilderService } from './proces-builder.service';
import { MeldingStateService } from '../../melding/state/melding-state.service';
import { Contact } from '../../../interfaces/melding.interface';

@Injectable({ providedIn: 'root' })
export class ProcesNavigatorService {
  private proces  = inject(ProcesBuilderService);
  private meldingState = inject(MeldingStateService);

  readonly kanVerder = computed(() => {
    const gegevens = this.meldingState.meldingData();
    const controles = [
      true, // Introductie stap - altijd door
      !!gegevens?.afbeeldingUrl, // Foto stap - foto required
      !!gegevens?.locatie, // Locatie stap - locatie required
      true, // Contact stap - optioneel, altijd door
      this.isVolledig(gegevens) // Controle stap - alles required
    ];
    return controles[this.proces.huidigeStap()] ?? true;
  });

  volgende() { 
    // Voor nu altijd toestaan om door te gaan voor debugging
    this.proces.volgende(); 
  }
  vorige()   { this.proces.vorige(); }
  gaNaar(index: number) { this.proces.huidigeStap.set(index); }

  private isContactGeldig(contact?: Contact) {
    return contact ? contact.anoniem || !!(contact.email?.includes('@')) : true;
  }
  private isVolledig(gegevens: any) {
    return !!(gegevens?.afbeeldingUrl && gegevens?.locatie);
  }
}