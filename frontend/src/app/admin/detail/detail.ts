import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TijdlijnElementen } from '../tijdlijn-element/tijdlijn-element';
import { TijdlijnElement } from '../interfaces/tijdlijn-element.interface';
import { IDService } from '../services/id/id';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { State } from '../interfaces/state.interface';
import { ButtonModule } from 'primeng/button';

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
  imports: [CommonModule, TijdlijnElementen, InputTextModule, FormsModule, SelectModule, ButtonModule],
  templateUrl: './detail.html',
  styleUrl: './detail.scss'
})
export class DetailComponent implements OnInit {
  TEST = tijdlijnElementen;
  value: string = ''; // Initialize with a default value
  states!: State[];

  selectedStatus : string = '';

  ngOnInit() {
        this.states = [
          {status: 'Nieuw'},
          {status: 'Gecontroleerd'},
          {status: 'Ingepland'},
          {status: 'Opgehaald'}
        ];
    }

  constructor() {
    this.selection = inject(IDService);
  }
  public selection: IDService;

  closeDetail() {
    this.selection.closeDetail();
  }
}