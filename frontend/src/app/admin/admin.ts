import { inject } from '@angular/core';
import { Component, computed } from '@angular/core';
import { ListComponent } from './list/list';
import { DetailComponent } from './detail/detail';
import { IDService } from './services/id/id';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [ListComponent, DetailComponent],
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss']
})
export class AdminComponent {
  constructor() {
    this.selection = inject(IDService);
  }
  public selection: IDService;

  showDetail = computed(() => this.selection.isDetailOpen());
}