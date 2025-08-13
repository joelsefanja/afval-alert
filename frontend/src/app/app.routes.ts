import { Routes } from '@angular/router';
import { AdminComponent } from './admin/admin';

// Nieuwe AfvalMeldenProcedureComponent met Shadcn UI en signals
import { AfvalMeldenProcedureComponent } from './app-users/features/afval-melden';

export const routes: Routes = [
  { path: 'admin', component: AdminComponent },
  
  // Backwards compatibility
  { path: 'afval-detectie', component: AfvalMeldenProcedureComponent },
  
  // Direct naar AfvalMeldenProcedureComponent als root
  { path: '', component: AfvalMeldenProcedureComponent, pathMatch: 'full' },
  { path: '**', component: AfvalMeldenProcedureComponent }
];
