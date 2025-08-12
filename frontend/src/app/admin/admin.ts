import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ListComponent } from './list/list';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterOutlet, ListComponent],
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss']
})
export class AdminComponent {}
