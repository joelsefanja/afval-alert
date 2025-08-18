import { Component, computed, output, ViewChild, OnInit } from '@angular/core';
import { ListNotification } from '../interfaces/listnotification.interface';
import { TableModule, Table } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { IDService } from '../services/id/id';
import { FormsModule } from '@angular/forms';

const Test_Notification_Data: ListNotification[] = [
  { id: 1, location: 1, type: 'Grofvuil', status: 'Opgehaald', date: '03/07/2025' },
  { id: 2, location: 2, type: 'Aluminium', status: 'Gepland', date: '06/07/2025' },
  { id: 3, location: 3, type: 'Hout', status: 'In Behandeling', date: '20/07/2025' },
  { id: 4, location: 4, type: 'Grofvuil', status: 'Opgehaald', date: '04/07/2025' },
  { id: 5, location: 5, type: 'Aluminium', status: 'Gepland', date: '07/07/2025' },
  { id: 6, location: 6, type: 'Hout', status: 'In Behandeling', date: '12/07/2025' },
  { id: 7, location: 7, type: 'Grofvuil', status: 'Opgehaald', date: '09/07/2025' },
  { id: 8, location: 8, type: 'Aluminium', status: 'Gepland', date: '08/07/2025' },
  { id: 9, location: 9, type: 'Hout', status: 'In Behandeling', date: '18/07/2025' },
];

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [TableModule, InputTextModule, ButtonModule, TooltipModule, FormsModule],
  templateUrl: './list.html',
  styleUrl: './list.scss'
})
export class ListComponent {
  notifications = Test_Notification_Data;
  clicked = output<number>();

  @ViewChild('dt') dt!: Table;

  // Computed signal for current selection object
  selectedNotification = computed(() => {
    const id = this.selection.selectedId();
    return id !== null
      ? this.notifications.find(n => n.id === id) || null
      : null;
  });

  constructor(private selection: IDService) {}

  ngAfterViewInit() {
  // Enable PrimeNG session state for the table
  this.dt.stateKey = 'notificationTable';  // unique key for this table
  this.dt.stateStorage = 'session';        // store state in sessionStorage

  // Restore table state from session if it exists
  const stateExists = sessionStorage.getItem(this.dt.stateKey || '') !== null;

  if (!stateExists) {
    // Only apply default sort if there is no stored state
    this.dt.sortField = 'date';
    this.dt.sortOrder = -1; // descending
  } else {
    // Let the table restore the previous state (filters, sort, pagination)
    setTimeout(() => this.dt.restoreState(), 0);
  }
}


  goToDetails(item: ListNotification) {
    this.selection.select(item.id);
    this.clicked.emit(item.id);
  }
}