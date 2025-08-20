import { Component, inject, ViewChild, output, input, SimpleChange} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TijdlijnElementen } from '../tijdlijn-element/tijdlijn-element';
import { TijdlijnElement } from '../interfaces/tijdlijn-element.interface';
import { IDService } from '../services/id/id';
import { TextareaModule } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';
import { State } from '../features/dashboard/interfaces/state.interface';
import { ButtonModule } from 'primeng/button';
import { KaartService } from '../../app-users/features/afval-melden/services/kaart';
import { Kaart } from '../../app-users/features/afval-melden/components/locatie-stap/kaart';
import { NotificationStore } from '../features/dashboard/stores/notificatie.store';

import { ImageModule } from 'primeng/image';

import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, TijdlijnElementen, TextareaModule, FormsModule, SelectModule, ButtonModule, Kaart, ImageModule],
  templateUrl: './detail.html',
  styleUrl: './detail.scss'
})
export class DetailComponent {
  private kaartService = inject(KaartService);
  @ViewChild(Kaart) kaartComponent!: Kaart;
  value: string = ''; // Initialize with a default value
  states!: State[];

  selectedStatus : string = '';

  locationSelected = output<string>();
  locatieGeselecteerd = output<{latitude: number, longitude: number, address: string, wijk?: string, buurt?: string, gemeente?: string}>();

  searchQuery = '';
  selectedAddress = '';

  lastSelected : number | null = null;

  store = inject(NotificationStore);

  ngOnInit() {
        this.states = [
          {status: 'Nieuw'},
          {status: 'Gecontroleerd'},
          {status: 'Ingepland'},
          {status: 'Opgehaald'}
        ];

        this.setNotificaties();
    }

  constructor(public selection: IDService) {}

  closeDetail() {
    this.selection.closeDetail();
  }

  ngDoCheck() {
    if (this.selection.selectedId() !== this.lastSelected) {
      this.lastSelected = this.selection.selectedId();

      this.setNotificaties();
    }
  }

  setNotificaties() {
    this.store.fetch(this.selection.selectedId());
  }
}
