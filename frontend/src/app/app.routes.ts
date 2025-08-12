import { Routes } from '@angular/router';
import { AppUsersComponent } from './app-users/app-users';
import { AdminComponent } from './admin/admin';
import { AfvalDetectieComponent } from './app-users/afval-detectie/components/afval-detectie/afval-detectie';

export const routes: Routes = [
  { path: '', component: AppUsersComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'afval-detectie', component: AfvalDetectieComponent },
  { path: '**', redirectTo: '' }
];
