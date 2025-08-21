import { Injectable, inject, computed } from "@angular/core";
import { ImageService } from "../services/image.service";

@Injectable({ providedIn: 'root' })
export class NotificationStore {
  private readonly imageService = inject(ImageService);

  readonly image = computed(() => {
    return this.imageService.notifications().data;
  });

  fetch(id: number | null | undefined) {
    this.imageService.fetchImage(id);
  }
}
