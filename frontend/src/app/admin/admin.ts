import { Component, computed } from '@angular/core';
import { ListComponent } from './list/list';
import { DetailComponent } from './detail/detail';
import { SelectionService } from './core/id';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [ListComponent, DetailComponent],
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss']
})
export class AdminComponent {
  constructor(public selection: SelectionService) {}

  showDetail = computed(() => this.selection.isDetailOpen());
}