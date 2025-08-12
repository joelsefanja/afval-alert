import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TijdlijnElementen } from '../tijdlijn-element/tijdlijn-element';
import { TijdlijnElement } from '../tijdlijn-element.interface';
import { MatButton } from '@angular/material/button';

const tijdlijnElementen: TijdlijnElement[] = [
  {status: "Nieuw", note: "test", date: new Date(2020, 1, 1)},
  {status: "Gevontrolleerd", note: "test", date: new Date(2020, 1, 2)},
  {status: "Ingepland", note: "test", date: new Date(2020, 1, 4)},
  {status: "Opgehaald", note: "test", date: new Date(2020, 1, 5)},
]

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, TijdlijnElementen, MatButton],
  templateUrl: './detail.html',
  styleUrl: './detail.scss'
})
export class DetailComponent {
  TEST = tijdlijnElementen;
  id: number | null = null;

  clicked = output();

  constructor(private route: ActivatedRoute) {
    this.route.paramMap.subscribe(params => {
      this.id = Number(params.get('id'));
    });
  }

  closeDetail() {
    this.clicked.emit();
  }
}
