import { Injectable, signal } from '@angular/core';
import { AfvalMeldingConceptDto, LocatieGegevensDto, ContactGegevensDto } from '../dto/frontend.dto';
import { AfvalMeldingVoorBackendDto } from '../dto/backend.dto';

@Injectable({ providedIn: 'root' })
export class AfvalMeldingStateService {
  private afvalMeldingGegevens = signal<AfvalMeldingConceptDto>({});

  readonly afvalMeldingConcept = this.afvalMeldingGegevens.asReadonly();

  plaatsConceptId(conceptId: string) {
    this.afvalMeldingGegevens.update(gegevens => ({ ...gegevens, conceptId }));
  }

  plaatsLocatie(locatie: LocatieGegevensDto) {
    this.afvalMeldingGegevens.update(gegevens => ({ ...gegevens, locatie }));
  }

  plaatsContactGegevens(contactGegevens: ContactGegevensDto) {
    this.afvalMeldingGegevens.update(gegevens => ({ ...gegevens, contact: contactGegevens }));
  }

  // Prepare data for backend submission (strips address)
  verkrijgMeldingVoorBackend(): AfvalMeldingVoorBackendDto {
    const concept = this.afvalMeldingGegevens();
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
    this.afvalMeldingGegevens.set({});
  }
}