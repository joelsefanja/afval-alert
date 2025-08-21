import { Routes } from '@angular/router';
import { AdminComponent } from './admin/admin';

// Nieuwe AfvalMeldenComponent met Shadcn UI en signals
import { AfvalMeldenComponent } from './app-users/features/afval-melden/components/afval-melden';

export const routes: Routes = [
  
  { path: '', component: AfvalMeldenComponent, pathMatch: 'full' },
  { path: 'admin', component: AdminComponent },
  { path: '**', component: AfvalMeldenComponent }
];
