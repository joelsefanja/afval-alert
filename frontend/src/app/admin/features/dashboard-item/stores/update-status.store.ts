import { Injectable, inject } from "@angular/core";
import { UpdateStatusService } from "../services/update-status/update-status.service";
import { State } from "../../dashboard/interfaces/state.interface";

@Injectable({ providedIn: 'root' })
export class UpdateStatusStore {
  private readonly updateStatusService = inject(UpdateStatusService);

  update(id: number | null | undefined, newStatus: State) {
    console.log(newStatus);
    this.updateStatusService.updateStatus(id, newStatus);
  }
}
