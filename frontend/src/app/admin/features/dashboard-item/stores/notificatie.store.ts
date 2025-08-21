import { Injectable, computed, inject } from "@angular/core";
import { TijdlijnElement } from "@app/admin/features/dashboard-item/interfaces/tijdlijn-element.interface";
import { DashboardItemService } from "../services/dashboard-item/dashboard-item.service.ts";
import { IDService } from "@app/admin/features/dashboard/services/id/id";
import { NotitieService } from "../services/notitie/notitie.service.js";
import { Notitie } from "../interfaces/notitie.interface.js";


@Injectable({ providedIn: 'root' })
export class NotificationStore {
  private readonly dashboardItemService = inject(DashboardItemService);
  private readonly notitieService = inject(NotitieService);

  readonly notificaties = computed(() => {
    return this.dashboardItemService.notifications();
});

  fetch(id: number | null | undefined) {
    this.dashboardItemService.fetchNotities(id);
  }

  post(id: number | null | undefined, notitie: Notitie) {
    this.notitieService.postNotitie(id, notitie);
  }
}
