import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UuidService {
  private meldingUuid = signal<string | null>(null);

  generateMeldingUuid(): string {
    const uuid = this.generateUUID();
    this.meldingUuid.set(uuid);
    this.saveToSession(uuid);
    return uuid;
  }

  getMeldingUuid(): string | null {
    if (!this.meldingUuid()) {
      const stored = this.loadFromSession();
      this.meldingUuid.set(stored);
    }
    return this.meldingUuid();
  }

  clearMeldingUuid(): void {
    this.meldingUuid.set(null);
    sessionStorage.removeItem('afval-melding-uuid');
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private saveToSession(uuid: string): void {
    sessionStorage.setItem('afval-melding-uuid', uuid);
  }

  private loadFromSession(): string | null {
    return sessionStorage.getItem('afval-melding-uuid');
  }
}