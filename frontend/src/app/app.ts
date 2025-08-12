import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LocatiePicker } from './afvalmelding/locatie/locatie-picker/locatie-picker';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LocatiePicker],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('afval-alert');
}
