import { Component, computed, output, ViewChild, AfterViewInit } from '@angular/core';
import { ListNotification } from '../interfaces/listnotification.interface';
import { TableModule, Table } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { IDService } from '../services/id/id';
import { SliderModule } from 'primeng/slider';
import { CommonModule, DatePipe } from '@angular/common';

const Test_Notification_Data: ListNotification[] = [
  { id: 1, location: 1, type: 'Grofvuil', status: 'Opgehaald', date: new Date(2025, 6, 3) },  // 03/07/2025
  { id: 2, location: 2, type: 'Aluminium', status: 'Gepland', date: new Date(2025, 6, 6) },  // 06/07/2025
  { id: 3, location: 3, type: 'Hout', status: 'In Behandeling', date: new Date(2025, 6, 20) }, // 20/07/2025
  { id: 4, location: 4, type: 'Grofvuil', status: 'Opgehaald', date: new Date(2025, 6, 4) },  // 04/07/2025
  { id: 5, location: 5, type: 'Aluminium', status: 'Gepland', date: new Date(2025, 6, 7) },  // 07/07/2025
  { id: 6, location: 6, type: 'Hout', status: 'In Behandeling', date: new Date(2025, 6, 12) }, // 12/07/2025
  { id: 7, location: 7, type: 'Grofvuil', status: 'Opgehaald', date: new Date(2025, 6, 9) },  // 09/07/2025
  { id: 8, location: 8, type: 'Aluminium', status: 'Gepland', date: new Date(2025, 6, 8) },  // 08/07/2025
  { id: 9, location: 9, type: 'Hout', status: 'In Behandeling', date: new Date(2025, 6, 18) }, // 18/07/2025
];

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    TooltipModule,
    MultiSelectModule,
    FormsModule,
    SliderModule,
  ],
  templateUrl: './list.html',
  styleUrl: './list.scss'
})
export class ListComponent implements AfterViewInit {
  notifications = Test_Notification_Data;
  clicked = output<number>();
  @ViewChild('dt') dt!: Table;
  selectedNotification = computed(() => {
    const id = this.selection.selectedId();
    return id !== null ? this.notifications.find(n => n.id === id) || null : null;
  });
  // Options for p-multiSelect
  typeOptions = [
    { label: 'Grofvuil', value: 'Grofvuil' },
    { label: 'Hout', value: 'Hout' },
    { label: 'Aluminium', value: 'Aluminium' },
  ];
  selectedTypes: string[] = [];

  stateOptions = [
    { label: 'Nieuw', value: 'Nieuw' },
    { label: 'In Behandeling', value: 'In Behandeling' },
    { label: 'Gepland', value: 'Gepland' },
    { label: 'Opgehaald', value: 'Opgehaald' },
  ];
  stateTypes: string[] = [];

  constructor(private selection: IDService) {}

  ngAfterViewInit() {
    this.dt.stateKey = 'notificationTable';
    this.dt.stateStorage = 'session';
    const stateExists = sessionStorage.getItem(this.dt.stateKey || '') !== null;
    if (!stateExists) {
      this.dt.sortField = 'date';
      this.dt.sortOrder = -1;
    } else {
      setTimeout(() => this.dt.restoreState(), 0);
    }
  }

  goToDetails(item: ListNotification) {
    this.selection.select(item.id);
    this.clicked.emit(item.id);
  }

  onTypeFilterChange() {
    if (this.selectedTypes.length === 0) {
      this.dt.filter(null, 'type', 'in');
    } else {
      this.dt.filter(this.selectedTypes, 'type', 'in');
    }
  }
}