import { Injectable, signal, computed, inject } from '@angular/core';
import { ProcesStapValidatie } from '@interfaces/proces-stap-validatie.interface';

@Injectable({ providedIn: 'root' })
export class FotoStapService implements ProcesStapValidatie {
  readonly foto = signal<File | null>(null);

  readonly isGeldigFormulier = computed(() => !!this.foto());

  isGeldig(): boolean { return this.isGeldigFormulier(); }

  opslaan(): void { 
    // Foto upload happens in the media service, not here
    // This service just validates the form
  }
}
