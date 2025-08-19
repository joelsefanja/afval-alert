import { Component, computed, output, ViewChild, AfterViewInit, OnInit, inject } from '@angular/core';
import { ListNotification } from '../interfaces/listnotification.interface';
import { TableModule, Table } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { IDService } from '../services/id/id';
import { SliderModule } from 'primeng/slider';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../services/dashboard/dashboard.service';

/*const Test_Notification_Data: ListNotification[] = [
  { id: 1, location: 1, type: 'Grofvuil', status: 'Opgehaald', date: new Date(2025, 6, 3) },  // 03/07/2025
  { id: 2, location: 2, type: 'Aluminium', status: 'Gepland', date: new Date(2025, 6, 6) },  // 06/07/2025
  { id: 3, location: 3, type: 'Hout', status: 'In Behandeling', date: new Date(2025, 6, 20) }, // 20/07/2025
  { id: 4, location: 4, type: 'Grofvuil', status: 'Opgehaald', date: new Date(2025, 6, 4) },  // 04/07/2025
  { id: 5, location: 5, type: 'Aluminium', status: 'Gepland', date: new Date(2025, 6, 7) },  // 07/07/2025
  { id: 6, location: 6, type: 'Hout', status: 'In Behandeling', date: new Date(2025, 6, 12) }, // 12/07/2025
  { id: 7, location: 7, type: 'Grofvuil', status: 'Opgehaald', date: new Date(2025, 6, 9) },  // 09/07/2025
  { id: 8, location: 8, type: 'Aluminium', status: 'Gepland', date: new Date(2025, 6, 8) },  // 08/07/2025
  { id: 9, location: 9, type: 'Hout', status: 'In Behandeling', date: new Date(2025, 6, 18) }, // 18/07/2025
];*/

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
export class ListComponent implements AfterViewInit, OnInit {
  clicked = output<number>();
  @ViewChild('dt') dt!: Table;
  dashboardService = inject(DashboardService);
  notifications = this.dashboardService.notifications;

  selectedNotification = computed(() => {
  const id = this.selection.selectedId();
  const list = this.notifications(); // <-- call the signal
  if (id == null) return null;
  return list.find(n => n.id === id) ?? null;
});
  
  // Options for p-multiSelect
  typeOptions = [
  { label: 'Grofvuil', value: 'GROFVUIL' },
  { label: 'Kleinvuil', value: 'KLEINVUIL' },
  { label: 'Glas', value: 'GLAS' },
  { label: 'Overig', value: 'OVERIG' },
  { label: 'Hout', value: 'HOUT' },        
  { label: 'Aluminium', value: 'ALUMINIUM' }, 
];
  selectedTypes: string[] = [];

  stateOptions = [
  { label: 'Nieuw', value: 'NIEUW' },
  { label: 'Melding Verwerkt', value: 'MELDINGVERWERKT' },
  { label: 'Opgehaald', value: 'OPGEHAALD' },
  { label: 'Wordt Opgehaald', value: 'WORDTOPGEHAALD' },
];
  selectedStates: string[] = [];

  constructor(
    private selection: IDService,
  ) {}


  ngOnInit() {
    this.dashboardService.fetchNotifications();
  }

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
  // Apply type filter
  this.dt.filter(
    this.selectedTypes && this.selectedTypes.length ? this.selectedTypes : null,
    'type',
    'in'
  );

  // Apply status filter
  this.dt.filter(
    this.selectedStates && this.selectedStates.length ? this.selectedStates : null,
    'status',
    'in'
  );
}
}