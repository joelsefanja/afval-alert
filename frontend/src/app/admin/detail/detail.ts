import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TijdlijnElementen } from '../tijdlijn-element/tijdlijn-element';
import { TijdlijnElement } from '../tijdlijn-element.interface';
import { MatButtonModule } from '@angular/material/button';
import { SelectionService } from '../core/id';

const tijdlijnElementen: TijdlijnElement[] = [
  { status: "Nieuw", note: "test", date: new Date(2020, 1, 1) },
  { status: "Gecontroleerd", note: "test", date: new Date(2020, 1, 2) },
  { status: "Ingepland", note: "test", date: new Date(2020, 1, 4) },
  { status: "Opgehaald", note: "test", date: new Date(2020, 1, 5) },
];

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, TijdlijnElementen, MatButtonModule],
  templateUrl: './detail.html',
  styleUrl: './detail.scss'
})
export class DetailComponent {
  TEST = tijdlijnElementen;

  constructor(public selection: SelectionService) {}

  closeDetail() {
    this.selection.closeDetail();
  }
}