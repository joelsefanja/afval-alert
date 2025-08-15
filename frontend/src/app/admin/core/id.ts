import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SelectionService {
  selectedId = signal<number | null>(null);
  isDetailOpen = signal(false);

  select(id: number) {
    this.selectedId.set(id);
    this.isDetailOpen.set(true);
  }

  closeDetail() {
    this.isDetailOpen.set(false);
  }
}