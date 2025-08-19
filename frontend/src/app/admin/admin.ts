import { Component, computed } from '@angular/core';
import { ListComponent } from './list/list';
import { DetailComponent } from './detail/detail';
import { IDService } from './services/id/id';
import { nl } from 'primelocale/js/nl.js';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [ListComponent, DetailComponent],
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss']
})
export class AdminComponent {
  constructor(public selection: IDService) {}

  showDetail = computed(() => this.selection.isDetailOpen());
}