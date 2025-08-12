import { Component } from '@angular/core';
import { List } from './list/list';

@Component({
  selector: 'app-admin',
  imports: [List],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})


export class AdminComponent {
}
