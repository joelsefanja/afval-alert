import { Routes } from '@angular/router';
import { AdminComponent } from './admin/admin';

// Nieuwe AfvalMeldProcedureComponent met Shadcn UI en signals
import { AfvalMeldProcedureComponent } from './app-users/features/afval-melden';

export const routes: Routes = [
  
  { path: '', component: AfvalMeldProcedureComponent, pathMatch: 'full' },
  { path: 'admin', component: AdminComponent },
  { path: '**', component: AfvalMeldProcedureComponent }
];
