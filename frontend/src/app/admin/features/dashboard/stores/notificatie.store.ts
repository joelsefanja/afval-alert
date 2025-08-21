import { Injectable, computed, inject } from "@angular/core";
import { TijdlijnElement } from "@app/admin/interfaces/tijdlijn-element.interface";
import { DashboardItemServiceTs } from "@app/admin/services/dashboard-item/dashboard-item.service.ts";
import { IDService } from "@app/admin/services/id/id";


@Injectable({ providedIn: 'root' })
export class NotificationStore {
  private readonly dashboardItemService = inject(DashboardItemServiceTs);

  readonly notificaties = computed(() => {
    return this.dashboardItemService.notifications();
});

  fetch(id: number | null | undefined) {
    this.dashboardItemService.fetchNotities(id);
  }
}
