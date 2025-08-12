import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { List } from './admin/list/list';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, List],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('afval-alert');
}
