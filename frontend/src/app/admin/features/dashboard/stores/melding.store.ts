import { Injectable, computed, inject } from '@angular/core';
import { DashboardService } from '../services/dashboard.service/dashboard.service';
import { IDService } from '../services/id/id';
import { STATUS_ORDER, TYPE_ORDER, getReadableStatus, getReadableType } from '../utilities/melding-mappings';
import { LocatieService } from '@services/locatie/locatie.service';

@Injectable({ providedIn: 'root' })
export class NotificationStore {
  private readonly dashboardService = inject(DashboardService);
  private readonly locatieService = inject(LocatieService);
  private readonly selection = inject(IDService);

  readonly visibleNotifications = computed(() => 
    this.dashboardService.notifications().filter(n => n.type !== 'PENDING_AI')
);

  readonly typeOptions = computed(() => {
    const types = Array.from(new Set(this.visibleNotifications().map(n => n.type)));
    types.sort((a, b) => TYPE_ORDER.indexOf(a) - TYPE_ORDER.indexOf(b));
    return types.map(t => ({ label: getReadableType(t), value: t }));
  });

  readonly stateOptions = computed(() => {
    const statuses = Array.from(new Set(this.visibleNotifications().map(n => n.status)));
    statuses.sort((a, b) => {
      const ai = STATUS_ORDER.indexOf(a);
      const bi = STATUS_ORDER.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;     // unknowns at the end
      if (bi === -1) return -1;
      return ai - bi;
    });
    return statuses.map(s => ({ label: getReadableStatus(s), value: s }));
  });

  readonly selectedNotification = computed(() => {
    const id = this.selection.selectedId();
    if (id == null) return null;
    return this.dashboardService.notifications().find(n => n.id === id) ?? null;
  });

  fetch() {
    this.dashboardService.fetchMeldingen();
  }

  select(id: number) {
    this.selection.select(id);
  }
}