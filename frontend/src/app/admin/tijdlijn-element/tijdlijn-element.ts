import { Component, input } from '@angular/core';
import { TijdlijnElement } from '../tijdlijn-element.interface';

@Component({
  selector: 'app-tijdlijn-element',
  imports: [],
  templateUrl: './tijdlijn-element.html',
  styleUrl: './tijdlijn-element.scss'
})

export class TijdlijnElementen {
  tijdlijnElementen = input<TijdlijnElement[]>();
}
