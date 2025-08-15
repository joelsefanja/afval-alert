import { Routes } from '@angular/router';
import { AdminComponent } from './admin/admin';

// Nieuwe AfvalMeldenProcedureComponent met Shadcn UI en signals
import { AfvalMeldenProcedureComponent } from './app-users/features/afval-melden';

export const routes: Routes = [
  
  { path: '', component: AfvalMeldenProcedureComponent, pathMatch: 'full' },
  { path: 'admin', component: AdminComponent },
  { path: '**', component: AfvalMeldenProcedureComponent }
];
