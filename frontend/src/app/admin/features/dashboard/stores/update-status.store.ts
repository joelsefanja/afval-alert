import { Injectable, inject } from "@angular/core";
import { UpdateStatusService } from "../services/update-status.service";
import { State } from "../interfaces/state.interface";

@Injectable({ providedIn: 'root' })
export class NotificationStore {
  private readonly updateStatusService = inject(UpdateStatusService);

  update(id: number | null | undefined, newStatus: State) {
    console.log(newStatus);
    this.updateStatusService.updateStatus(id, newStatus);
  }
}
