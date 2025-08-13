import { Component, input } from '@angular/core';
import { TijdlijnElement } from '../tijdlijn-element.interface';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatCardFooter } from '@angular/material/card';

@Component({
  selector: 'app-tijdlijn-element',
  imports: [MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatCardFooter],
  templateUrl: './tijdlijn-element.html',
  styleUrl: './tijdlijn-element.scss'
})

export class TijdlijnElementen {
  tijdlijnElementen = input<TijdlijnElement[]>();
}
