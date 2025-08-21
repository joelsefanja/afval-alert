import { Component, inject, ViewChild, output, input, SimpleChange} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TijdlijnElementen } from '../tijdlijn-element/tijdlijn-element';
import { IDService } from '@app/admin/features/dashboard/services/id/id';
import { TextareaModule } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';
import { State } from '@app/admin/features/dashboard/interfaces/state.interface';
import { ButtonModule } from 'primeng/button';
import { KaartService } from '@services/locatie/kaart.service';
import { KaartComponent } from '@components/3-locatie-selectie/components';
import { LocatieService } from '@services/locatie/locatie.service';

import { NotificationStore } from '../../stores/notificatie.store';
import { ImageStore } from '../../stores/image.store';
import { UpdateStatusStore } from '../../stores/update-status.store';

import { ImageModule } from 'primeng/image';
import { TabsModule } from 'primeng/tabs';


import { SelectModule } from 'primeng/select';
import { state } from '@angular/animations';

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
  value: string = ''; // Initialize with a default value
  states!: State[];

  selectedStatus : string = '';
  notitie: string = "";

  locationSelected = output<string>();
  locatieGeselecteerd = output<{latitude: number, longitude: number, address: string, wijk?: string, buurt?: string, gemeente?: string}>();

  searchQuery = '';
  selectedAddress = '';

  lastSelected : number | null = null;
  notitieAdded: boolean = false;

  notificatieStore = inject(NotificationStore);
  imageStore = inject(ImageStore);
  updateStatusStore = inject (UpdateStatusStore);

  ngOnInit() {
        this.states = [
          {status: 'Nieuw'},
          {status: 'Meldingverwerkt'},
          {status: 'Wordtopgehaald'},
          {status: 'Opgehaald'}
        ];
    }

  constructor(public selection: IDService) {}

  closeDetail() {
    this.selection.closeDetail();
  }

  ngDoCheck() {
    if (this.selection.selectedId() !== this.lastSelected) {
      this.lastSelected = this.selection.selectedId();

      this.setNotificaties();
      this.setImage();
    } else if (this.notitieAdded) {
      this.setNotificaties();

      this.notitieAdded = false;
    }
  }

  setNotificaties() {
    this.notificatieStore.fetch(this.selection.selectedId());
  }

  setImage() {
    this.imageStore.fetch(this.selection.selectedId());
  }

  onUpdateStatus() {
    if (!this.selectedStatus || this.selectedStatus === "Selecteer een status") { return; }

    this.updateStatusStore.update(this.selection.selectedId(), {"status": this.selectedStatus});
    this.notificatieStore.post(this.selection.selectedId(), {"notitie": "Status verranderd naar: " + this.selectedStatus})

    this.notitieAdded = true;
  }
}
