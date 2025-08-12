import { Routes } from '@angular/router';
import { AppUsersComponent } from './app-users/app-users';
import { AdminComponent } from './admin/admin';

export const routes: Routes = [
  { path: '', component: AppUsersComponent },
  { path: 'admin', component: AdminComponent },
  { path: '**', redirectTo: '' }
];
