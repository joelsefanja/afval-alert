import { Component, input } from '@angular/core';
import { DatePipe} from '@angular/common';
import { TijdlijnElement } from '../interfaces/tijdlijn-element.interface';
import { TimelineModule } from 'primeng/timeline';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-tijdlijn-element',
  imports: [TimelineModule, CardModule, ButtonModule, DatePipe],
  templateUrl: './tijdlijn-element.html',
  styleUrl: './tijdlijn-element.scss'
})

export class TijdlijnElementen {
  tijdlijnElementen = input<TijdlijnElement[]>();
}
