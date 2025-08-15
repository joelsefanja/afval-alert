import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TijdlijnElementen } from '../tijdlijn-element/tijdlijn-element';
import { TijdlijnElement } from '../tijdlijn-element.interface';
import { MatButtonModule } from '@angular/material/button';
import { SelectionService } from '../core/id';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

import { SelectModule } from 'primeng/select';

const tijdlijnElementen: TijdlijnElement[] = [
  { status: "Nieuw", notes: ["Hier komt een eventuele opmerking te staan en als deze veel langer is dan gebeurd het volgende dus"], date: new Date(2020, 1, 1) },
  { status: "Gecontroleerd", notes: ['Of hier', 'Verplaatst naar 20/03', "Weer verplaatst"], date: new Date(2020, 1, 2) },
  { status: "Ingepland", notes: [], date: new Date(2020, 1, 4) },
  { status: "Opgehaald", notes: ["Afgehandeld"], date: new Date(2020, 1, 5) },
];

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, TijdlijnElementen, MatButtonModule, InputTextModule, FormsModule, SelectModule],
  templateUrl: './detail.html',
  styleUrl: './detail.scss'
})
export class DetailComponent {
  TEST = tijdlijnElementen;
  value: string = ''; // Initialize with a default value
  state: [] | undefined;

  selectedStatus : string = '';

  ngOnInit() {
        this.state = [
        ];
    }

  constructor(public selection: SelectionService) {}

  closeDetail() {
    this.selection.closeDetail();
  }
}