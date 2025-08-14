import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { MeldingConcept } from '../../../../../models/melding-concept';

@Injectable({
  providedIn: 'root'
})
export class SessieStorageService {
  private readonly STORAGE_KEY = 'afval-melding-concepten';

  /**
   * Slaat melding concept op in sessie storage
   */
  slaaMeldingConceptOp(melding: MeldingConcept): Observable<boolean> {
    try {
      const bestaandeConcepts = this.getAlleConcepts();
      const index = bestaandeConcepts.findIndex(c => c.id === melding.id);
      
      if (index >= 0) {
        bestaandeConcepts[index] = melding;
      } else {
        bestaandeConcepts.push(melding);
      }
      
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(bestaandeConcepts));
      return of(true);
    } catch (error) {
      console.error('Fout bij opslaan melding concept:', error);
      return throwError(() => new Error('Kon melding concept niet opslaan'));
    }
  }

  /**
   * Haalt melding concept op uit sessie storage
   */
  getMeldingConcept(meldingId: string): Observable<MeldingConcept | null> {
    try {
      const concepts = this.getAlleConcepts();
      const concept = concepts.find(c => c.id === meldingId);
      
      if (concept) {
        // Converteer datum string terug naar Date object
        concept.aanmaakDatum = new Date(concept.aanmaakDatum);
      }
      
      return of(concept || null);
    } catch (error) {
      console.error('Fout bij ophalen melding concept:', error);
      return of(null);
    }
  }

  /**
   * Verwijdert melding concept uit sessie storage
   */
  verwijderMeldingConcept(meldingId: string): Observable<boolean> {
    try {
      const concepts = this.getAlleConcepts();
      const gefilterdeConcepts = concepts.filter(c => c.id !== meldingId);
      
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(gefilterdeConcepts));
      return of(true);
    } catch (error) {
      console.error('Fout bij verwijderen melding concept:', error);
      return throwError(() => new Error('Kon melding concept niet verwijderen'));
    }
  }

  /**
   * Haalt alle melding concepten op
   */
  getAlleMeldingConcepten(): Observable<MeldingConcept[]> {
    try {
      const concepts = this.getAlleConcepts();
      // Converteer datum strings terug naar Date objecten
      concepts.forEach(concept => {
        concept.aanmaakDatum = new Date(concept.aanmaakDatum);
      });
      
      return of(concepts);
    } catch (error) {
      console.error('Fout bij ophalen alle melding concepten:', error);
      return of([]);
    }
  }

  /**
   * Ruimt oude concepten op (ouder dan 24 uur)
   */
  ruimOudeConceptenOp(): Observable<number> {
    try {
      const concepts = this.getAlleConcepts();
      const nu = new Date();
      const eenDagGeleden = new Date(nu.getTime() - 24 * 60 * 60 * 1000);
      
      const actieveConcepts = concepts.filter(concept => {
        const aanmaakDatum = new Date(concept.aanmaakDatum);
        return aanmaakDatum > eenDagGeleden;
      });
      
      const aantalVerwijderd = concepts.length - actieveConcepts.length;
      
      if (aantalVerwijderd > 0) {
        sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(actieveConcepts));
      }
      
      return of(aantalVerwijderd);
    } catch (error) {
      console.error('Fout bij opruimen oude concepten:', error);
      return of(0);
    }
  }

  private getAlleConcepts(): MeldingConcept[] {
    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Fout bij lezen uit sessie storage:', error);
      return [];
    }
  }
}