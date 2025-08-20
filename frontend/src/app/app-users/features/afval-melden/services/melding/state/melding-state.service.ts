import { Injectable, signal, inject } from '@angular/core';
import { MeldingConcept } from '@models/melding-concept';
import { Contact } from '../../../interfaces/melding.interface';
import { UuidService } from '../../opslag/uuid.service';

@Injectable({ providedIn: 'root' })
export class MeldingStateService {
  private uuidService = inject(UuidService);
  private data = signal<Partial<MeldingConcept>>({});

  readonly meldingData = this.data.asReadonly();

  initializeMelding(): string {
    const uuid = this.uuidService.generateMeldingUuid();
    this.data.update(d => ({ ...d, uuid }));
    return uuid;
  }

  getMeldingUuid(): string | null {
    return this.uuidService.getMeldingUuid();
  }

  setFoto(foto: string) {
    this.data.update(d => ({ ...d, afbeeldingUrl: foto }));
  }

  setLocatie(adres: string, lat: number, lng: number) {
    this.data.update(d => ({ ...d, locatie: { latitude: lat, longitude: lng, adres } }));
  }

  setContact(contact: Contact) {
    this.data.update(d => ({ ...d, contact }));
  }

  setAfvalTypes(afvalTypes: any[]) {
    this.data.update(d => ({ ...d, afvalTypes }));
  }

  reset() {
    this.data.set({});
    this.uuidService.clearMeldingUuid();
  }
}
