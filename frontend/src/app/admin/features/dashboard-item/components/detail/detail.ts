import { Component, inject, ViewChild, output, input, SimpleChange} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TijdlijnElementen } from '../tijdlijn-element/tijdlijn-element';
import { IDService } from '@app/admin/features/dashboard/services/id/id';
import { TextareaModule } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';
import { State } from '@app/admin/features/dashboard/interfaces/state.interface';
import { ButtonModule } from 'primeng/button';

import { NotificationStore } from '../../stores/notificatie.store';
import { ImageStore } from '../../stores/image.store';
import { UpdateStatusStore } from '../../stores/update-status.store';

import { ImageModule } from 'primeng/image';
import { TabsModule } from 'primeng/tabs';
import { DetailHeaderComponent } from '../detail-header/detail-header/detail-header';

import { SelectModule } from 'primeng/select';
import { DashboardItemStore } from '../../stores/dashboard-item.store';
import { SharedKaartComponent } from '@app/shared/components/kaart/shared-kaart.component';
import { getReadableStatus } from '../../../dashboard/utilities/melding-mappings';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, TijdlijnElementen, TextareaModule, FormsModule, SelectModule, ButtonModule, ImageModule, TabsModule, DetailHeaderComponent, SharedKaartComponent],
  templateUrl: './detail.html',
  styleUrl: './detail.scss'
})
export class DetailComponent {
  value: string = ''; // Initialize with a default value
  states!: State[];

  selectedStatus : string = '';
  notitie: string = "";

  locationSelected = output<string>();
  locatieGeselecteerd = output<{latitude: number, longitude: number, address: string, wijk?: string, buurt?: string, gemeente?: string}>();

  searchQuery = '';
  selectedAddress = '';

  lastSelected : number | null = null;

  notificatieStore = inject(NotificationStore);
  imageStore = inject(ImageStore);
  updateStatusStore = inject (UpdateStatusStore);
  dashboardItemStore = inject(DashboardItemStore);

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
      this.setItem();
    }
  }

  setNotificaties() {
    this.notificatieStore.fetch(this.selection.selectedId());
  }

  setImage() {
    this.imageStore.fetch(this.selection.selectedId());
  }

  setItem() {
    this.dashboardItemStore.fetch(this.selection.selectedId());
  }

  onUpdateStatus() {
    if (!this.statusSelected() && !this.hasNotitie()) { return; }

    this.updateStatusStore.update(this.selection.selectedId(), {"status": this.selectedStatus.toUpperCase()});

    if (this.statusSelected() && !this.hasNotitie()) {
      this.notificatieStore.post(this.selection.selectedId(), {"notitie": "Status verranderd naar: " + this.selectedStatus})
        .subscribe({
          next: () => this.setNotificaties(),
          error: err => console.error('Error adding notitie:', err)
        });
    } else if (this.statusSelected() && this.hasNotitie()) {
      this.notificatieStore.post(this.selection.selectedId(), {"notitie": "Status verranderd naar: " + this.selectedStatus + " --- " + this.notitie})
        .subscribe({
          next: () => this.setNotificaties(),
          error: err => console.error('Error adding notitie:', err)
        });
    }
  }

  statusSelected(): boolean {
    if (this.selectedStatus && this.selectedStatus !== "Selecteer een status") {
      return true;
    } else {
      return false;
    }
  }

  hasNotitie(): boolean {
    if (this.notitie && this.notitie !== "") {
      return true;
    } else {
      return false;
    }
  }
  @ViewChild(SharedKaartComponent) sharedKaartComponent!: SharedKaartComponent;

  onTabChange(event: any) {
    setTimeout(() => {
      const map = this.sharedKaartComponent.getMap();
      if (map) {
        map.invalidateSize();
      }
    }, 0);
  }


  getReadableStatus = getReadableStatus;
}
