import { Routes } from '@angular/router';
import { AppUsersComponent } from './app-users/app-users';
import { AdminComponent } from './admin/admin';
import { routes as adminRoutes } from './admin/admin.routes';

export const routes: Routes = [
  { path: '', component: AppUsersComponent },
  { path: 'admin', component: AdminComponent, children: adminRoutes },
  { path: '**', redirectTo: '' }
];
