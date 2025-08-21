import { Injectable, computed, inject } from '@angular/core';
import { DashboardItemService } from '../services/dashboard-item/dashboard-item.service.ts';
import { IDService } from '../../dashboard/services/id/id';
import { LocatieService } from '@services/locatie/locatie.service';

@Injectable({ providedIn: 'root' })
export class DashboardItemStore {
  private readonly dashboardService = inject(DashboardItemService);
  private readonly selection = inject(IDService);

  readonly selectedNotification = computed(() => {
    const currentItem = this.dashboardService.item();
    if (!currentItem) return null;

    const id = this.selection.selectedId();
    return currentItem.id === id ? currentItem : null;
  });

  fetch(id: number | null | undefined) {
    this.dashboardService.fetchDetails(id);
  }

  select(id: number) {
    this.selection.select(id);
  }
}