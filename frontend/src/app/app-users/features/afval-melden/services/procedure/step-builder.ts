// src/app/services/procedure/step-builder.ts
import { Injectable, signal, computed } from '@angular/core';
import { AfvalMeldProcedureStap } from '../melding/melding-state.service';

import { FotoStapComponent }         from '../../components/foto-stap/foto-stap.component';
import { LocatieStapComponent }      from '../../components/locatie-stap/locatie-stap.component';
import { ClassificatieStapComponent }from '../../components/classificatie-stap/classificatie-stap.component';
import { ContactStapComponent }      from '../../components/contact-stap/contact-stap.component';
import { ControleStapComponent }     from '../../components/controle-stap/controle-stap.component';
import { SuccesStapComponent }       from '../../components/succes-stap/succes-stap.component';

export interface Step {
  id: AfvalMeldProcedureStap;
  title: string;
  component: any;
}

@Injectable({ providedIn: 'root' })
export class StepBuilder {
  private _steps = signal<Step[]>([]);
  readonly steps        = this._steps.asReadonly();
  readonly activeIndex  = computed(() =>
    this._steps().findIndex(s => s.id === this._activeStep())
  );
  readonly currentComp  = computed(() =>
    this._steps()[this.activeIndex()]?.component ?? null
  );
  private _activeStep   = signal(AfvalMeldProcedureStap.FOTO);

  add(id: AfvalMeldProcedureStap, title: string, component: any) {
    this._steps.update(list => [...list, { id, title, component }]);
    return this;
  }

  next() {
    const idx = this.activeIndex();
    if (idx < this._steps().length - 1) {
      this._activeStep.set(this._steps()[idx + 1].id);
    }
  }

  constructor() {
    this
      .add(AfvalMeldProcedureStap.FOTO,         'Foto',         FotoStapComponent)
      .add(AfvalMeldProcedureStap.LOCATIE,      'Locatie',      LocatieStapComponent)
      .add(AfvalMeldProcedureStap.CLASSIFICATIE,'Classificatie',ClassificatieStapComponent)
      .add(AfvalMeldProcedureStap.CONTACT,      'Contact',      ContactStapComponent)
      .add(AfvalMeldProcedureStap.CONTROLE,     'Controle',     ControleStapComponent)
      .add(AfvalMeldProcedureStap.SUCCES,       'Succes',       SuccesStapComponent);
  }
}