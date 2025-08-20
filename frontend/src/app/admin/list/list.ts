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

  public visibleNotifications = computed(() =>
  this.notifications().filter(n => n.status !== 'PENDING_AI')
  );

  selectedNotification = computed(() => {
  const id = this.selection.selectedId();
  const list = this.notifications(); // <-- call the signal
  if (id == null) return null;
  return list.find(n => n.id === id) ?? null;
  });
  

  //Mapping voor afvaltype
  typeLabels: { [key: string]: string } = {
    KLEINVUIL: 'Kleinvuil',
    GLAS: 'Glas',
    GROFVUIL: 'Grofvuil',
    OVERIG: 'Overig',
  };

  //Returned leesbare labels voor afvaltype
  getReadableType(type: string): string {
    return this.typeLabels[type] || type; 
  }

  //Mapping voor status
  statusLabels: { [key: string]: string } = {
      NIEUW: 'Nieuw',
      MELDINGVERWERKT: 'Melding verwerkt',
      WORDTOPGEHAALD: 'Wordt opgehaald',
      OPGEHAALD: 'Opgehaald',
  };

  //Returned leesbare labels voor status
  getReadableStatus(status: string): string {
    return this.statusLabels[status] || status; 
  }

  // Opties voor het afvaltype filter
  typeOptions = computed(() => {
    const types = Array.from(
      new Set(this.notifications().map(n => n.type))
    );
    return types.map(t => ({
      label: this.getReadableType(t),
      value: t
    }));
  });

  //Opslaan van geselecteerde types in het filter
  selectedTypes: string[] = [];

  //Opties voor het status filter
  stateOptions = computed(() => {
    const statuses = Array.from(
      new Set(this.notifications().map(n => n.status))
    );
    return statuses.map(s => ({
      label: this.getReadableStatus(s),
      value: s
    }));
  });

  //Opslaan van geselecteerde status in het filter
  selectedStates: string[] = [];

  constructor(
    private selection: IDService,
  ) {}

  //Ophalen van meldingen bij
  ngOnInit() {
    this.dashboardService.fetchMeldingen();
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

  //Toepassen van filters na input
  onTypeFilterChange() {
    // Type filter
    this.dt.filter(
      this.selectedTypes && this.selectedTypes.length ? this.selectedTypes : null,
      'type',
      'in'
    );

    // Status filter
    this.dt.filter(
      this.selectedStates && this.selectedStates.length ? this.selectedStates : null,
      'status',
      'in'
    );
  }
}