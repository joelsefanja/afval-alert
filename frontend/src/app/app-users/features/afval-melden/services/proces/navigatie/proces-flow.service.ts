import { Injectable, inject } from '@angular/core';
import { ProcesBuilderService } from './proces-builder.service';

@Injectable({ providedIn: 'root' })
export class ProcesFlowService {
  private proces = inject(ProcesBuilderService);
  volgende() { this.proces.volgende(); }
  vorige()   { this.proces.vorige(); }
  reset()    { this.proces.reset(); }
  magStapTerug() { return this.proces.magStapTerug(); }
}