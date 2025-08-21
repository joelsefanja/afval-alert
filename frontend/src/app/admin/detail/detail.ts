import { Component, inject, ViewChild, output} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TijdlijnElementen } from '../tijdlijn-element/tijdlijn-element';
import { TijdlijnElement } from '../interfaces/tijdlijn-element.interface';
import { IDService } from '../services/id/id';
import { TextareaModule } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';
import { State } from '../features/dashboard/interfaces/state.interface';
import { ButtonModule } from 'primeng/button';
import { KaartService } from '@services/locatie/kaart.service';
import { KaartComponent } from '@components/3-locatie-selectie/components';
import { LocatieService } from '@services/locatie/locatie.service';

import { ImageModule } from 'primeng/image';
import { TabsModule } from 'primeng/tabs';
  

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
  imports: [CommonModule, TijdlijnElementen, TextareaModule, FormsModule, SelectModule, ButtonModule, KaartComponent, ImageModule, TabsModule],
  templateUrl: './detail.html',
  styleUrl: './detail.scss'
})
export class DetailComponent {
  private kaartService = inject(KaartService);
  private locatieService = inject(LocatieService);

  @ViewChild(KaartComponent) kaartComponent!: KaartComponent;
  TEST = tijdlijnElementen;
  value: string = ''; // Initialize with a default value
  states!: State[];

  selectedStatus : string = '';

  locationSelected = output<string>();
  locatieGeselecteerd = output<{latitude: number, longitude: number, address: string, wijk?: string, buurt?: string, gemeente?: string}>();

  searchQuery = '';
  selectedAddress = '';

  ngOnInit() {
        this.states = [
          {status: 'Nieuw'},
          {status: 'Gecontroleerd'},
          {status: 'Ingepland'},
          {status: 'Opgehaald'}
        ];
    }

  constructor(public selection: IDService) {}

  closeDetail() {
    this.selection.closeDetail();
  }


}