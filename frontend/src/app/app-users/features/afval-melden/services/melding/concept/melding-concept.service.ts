import { Injectable, signal, computed } from '@angular/core';
import { AfvalMeldingConceptDto, LocatieGegevensDto, ContactGegevensDto } from '../dto/frontend.dto';

/**
 * Melding concept management
 * Focused op concept state management
 */
@Injectable({ providedIn: 'root' })
export class MeldingConceptService {
  // Private state
  private readonly _concept = signal<AfvalMeldingConceptDto>({});
  
  // Public readonly signal
  readonly concept = this._concept.asReadonly();
  
  // Computed properties
  readonly heeftConceptId = computed(() => !!this._concept().conceptId);
  readonly heeftLocatie = computed(() => !!this._concept().locatie);
  readonly heeftContact = computed(() => !!this._concept().contact);
  readonly isVolledig = computed(() => 
    this.heeftConceptId() && this.heeftLocatie() && this.heeftContact()
  );
  
  // === CONCEPT ID ===
  plaatsConceptId(conceptId: string): void {
    if (!conceptId.trim()) {
      throw new Error('Concept ID mag niet leeg zijn');
    }
    this._concept.update(concept => ({ ...concept, conceptId }));
  }
  
  krijgConceptId(): string | undefined {
    return this._concept().conceptId;
  }
  
  // === LOCATIE ===
  plaatsLocatie(locatie: LocatieGegevensDto): void {
    if (!locatie.breedtegraad || !locatie.lengtegraad) {
      throw new Error('Locatie coördinaten zijn verplicht');
    }
    this._concept.update(concept => ({ ...concept, locatie }));
  }
  
  krijgLocatie(): LocatieGegevensDto | undefined {
    return this._concept().locatie;
  }
  
  verwijderLocatie(): void {
    this._concept.update(concept => {
      const { locatie, ...rest } = concept;
      return rest;
    });
  }
  
  // === CONTACT ===
  plaatsContact(contact: ContactGegevensDto): void {
    this._concept.update(concept => ({ ...concept, contact }));
  }
  
  krijgContact(): ContactGegevensDto | undefined {
    return this._concept().contact;
  }
  
  verwijderContact(): void {
    this._concept.update(concept => {
      const { contact, ...rest } = concept;
      return rest;
    });
  }
  
  // === UTILITY ===
  krijgVolledigConcept(): AfvalMeldingConceptDto {
    return { ...this._concept() };
  }
  
  updateConcept(updates: Partial<AfvalMeldingConceptDto>): void {
    this._concept.update(concept => ({ ...concept, ...updates }));
  }
  
  resetConcept(): void {
    this._concept.set({});
  }
  
  exporteerVoorBackend(): {
    conceptId: string;
    locatie: { breedtegraad: number; lengtegraad: number };
    contact: ContactGegevensDto;
  } {
    const concept = this._concept();
    
    if (!concept.conceptId || !concept.locatie || !concept.contact) {
      throw new Error('Concept is niet volledig voor backend export');
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
}