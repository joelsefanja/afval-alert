
import { Type } from '@angular/core';
import { ProcesStapValidatie } from '@interfaces/proces-stap-validatie.interface';

export interface ProcesStap {
  naam: symbol;
  label: string;
  component: Type<any>;
  icon?: string;
  disabled?: boolean;
  validatie?: ProcesStapValidatie;
  hideInMenu?: boolean;
}
