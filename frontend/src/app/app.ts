import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styles: [`
    :host {
      display: block;
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
      padding: 0;
    }
  `]
})
export class App {
  protected readonly title = signal('afval-alert');
}
