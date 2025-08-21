import { Injectable, signal } from '@angular/core';
import { AfvalMeldingConceptDto, LocatieGegevensDto, ContactGegevensDto } from '../dto/frontend.dto';
import { AfvalMeldingVoorBackendDto } from '../dto/backend.dto';
import { AfvalMeldingStatus } from '../../../../../../models/melding-status';

@Injectable({ providedIn: 'root' })
export class AfvalMeldingStateService {
  private readonly _afvalMeldingGegevens = signal<AfvalMeldingConceptDto>({});
  private readonly _meldingStatus = signal<AfvalMeldingStatus>(AfvalMeldingStatus.CONCEPT);
  private readonly _fotoStapOvergeslagen = signal(false);

  // Public readonly properties
  readonly afvalMeldingConcept = this._afvalMeldingGegevens.asReadonly();
  readonly meldingStatus = this._meldingStatus.asReadonly();
  readonly fotoStapOvergeslagen = this._fotoStapOvergeslagen.asReadonly();

  setMeldingStatus(status: AfvalMeldingStatus): void {
    this._meldingStatus.set(status);
  }

  setFotoStapOvergeslagen(overgeslagen: boolean): void {
    this._fotoStapOvergeslagen.set(overgeslagen);
  }

  plaatsConceptId(conceptId: string) {
    this._afvalMeldingGegevens.update(gegevens => ({ ...gegevens, conceptId }));
  }

  plaatsLocatie(locatie: LocatieGegevensDto) {
    this._afvalMeldingGegevens.update(gegevens => ({ ...gegevens, locatie }));
  }

  melderContactGegevens(contactGegevens: ContactGegevensDto) {
    this._afvalMeldingGegevens.update(gegevens => ({ ...gegevens, contact: contactGegevens }));
  }

  // Prepare data for backend submission (strips address)
  verkrijgMeldingVoorBackend(): AfvalMeldingVoorBackendDto {
    const concept = this._afvalMeldingGegevens();
    if (!concept.conceptId || !concept.locatie || !concept.contact) {
      throw new Error('Concept is niet volledig voor verzending');
    }
    
    return {
      conceptId: concept.conceptId,
      locatie: {
        breedtegraad: concept.locatie.breedtegraad,
        lengtegraad: concept.locatie.lengtegraad
      },
      contact: concept.contact
    };
  }

  herstelBeginwaarden() {
    this._afvalMeldingGegevens.set({});
    this._meldingStatus.set(AfvalMeldingStatus.CONCEPT);
    this._fotoStapOvergeslagen.set(false);
  }
}