import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class IDService {
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