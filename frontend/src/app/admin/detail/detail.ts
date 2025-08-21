import { Component, inject, ViewChild, output, input, SimpleChange} from '@angular/core';
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

import { NotificationStore as NotificatieStore }  from '../features/dashboard/stores/notificatie.store';
import { NotificationStore as ImageStore} from '../features/dashboard/stores/image.store';

import { ImageModule } from 'primeng/image';
import { TabsModule } from 'primeng/tabs';
  

import { SelectModule } from 'primeng/select';

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

  locationSelected = output<string>();
  locatieGeselecteerd = output<{latitude: number, longitude: number, address: string, wijk?: string, buurt?: string, gemeente?: string}>();

  searchQuery = '';
  selectedAddress = '';

  lastSelected : number | null = null;

  notificatieStore = inject(NotificatieStore);
  imageStore = inject(ImageStore);

  ngOnInit() {
        this.states = [
          {status: 'Nieuw'},
          {status: 'Gecontroleerd'},
          {status: 'Ingepland'},
          {status: 'Opgehaald'}
        ];

        this.setNotificaties();
        this.setImage();
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
    }
  }

  setNotificaties() {
    this.notificatieStore.fetch(this.selection.selectedId());
  }

  setImage() {
    this.imageStore.fetch(this.selection.selectedId());

    console.log(this.imageStore.image);
  }
}
