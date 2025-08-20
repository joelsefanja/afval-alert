import { Component, output, ViewChild, AfterViewInit, OnInit, inject, WritableSignal, signal } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SliderModule } from 'primeng/slider';

import { IDService } from '../../../../services/id/id';
import { ListNotification } from '../../interfaces/listnotification.interface';
import { NotificationStore } from '../../stores/melding.store';
import { getReadableStatus, getReadableType } from '../../utilities/melding-mappings';
import { MultiSelectFilter} from '../multi-select-filter/multi-select-filter';

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
    MultiSelectFilter
  ],
  templateUrl: './list.html',
  styleUrl: './list.scss'
})
export class ListComponent implements AfterViewInit, OnInit {
  clicked = output<number>();
  @ViewChild('dt') dt!: Table;

  

  private selection = inject(IDService);
  store = inject(NotificationStore);

  selectedTypes: string[] = [];
  selectedStates: string[] = [];

  ngOnInit() {
    this.store.fetch();
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
    this.dt.filter(this.selectedTypes?.length ? this.selectedTypes : null, 'type', 'in');
    this.dt.filter(this.selectedStates?.length ? this.selectedStates : null, 'status', 'in');
  }

  getReadableType = getReadableType;
  getReadableStatus = getReadableStatus;
}