import { Routes } from '@angular/router';
import { DetailComponent } from './features/dashboard-item/components/detail/detail';

export const routes: Routes = [
  { path: '', component: DetailComponent },
  { path: 'details/:id', component: DetailComponent }
];