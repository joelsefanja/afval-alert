import { Injectable, computed, inject } from "@angular/core";
import { NotificatieService } from "../services/notificatie-service/notificatie.service.js";
import { IDService } from "@app/admin/features/dashboard/services/id/id";
import { NotitieService } from "../services/notitie/notitie.service.js";
import { Notitie } from "../interfaces/notitie.interface.js";


@Injectable({ providedIn: 'root' })
export class NotificationStore {
  private readonly notificatieService = inject(NotificatieService);
  private readonly notitieService = inject(NotitieService);

  readonly notificaties = computed(() => {
    return this.notificatieService.notifications();
});

  fetch(id: number | null | undefined) {
    this.notificatieService.fetchNotities(id);
  }

  post(id: number | null | undefined, notitie: Notitie) {
    this.notitieService.postNotitie(id, notitie);
  }
}
