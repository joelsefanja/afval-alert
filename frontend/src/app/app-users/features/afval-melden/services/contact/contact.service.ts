import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface ContactGegevens {
  email?: string;
  naam?: string;
}

/**
 * Service voor het beheren van contactgegevens voor meldingen.
 * 
 * Deze service biedt functionaliteit voor:
 * - Valideren van contactgegevens
 * - Opslaan van contactgegevens
 * - Verzenden van contactgegevens naar backend
 */
@Injectable({
  providedIn: 'root'
})
export class ContactService {
  
  /**
   * Valideert de opgegeven contactgegevens
   * 
   * @param contactGegevens De te valideren contactgegevens
   * @returns True als de gegevens geldig zijn, anders false
   */
  validateContactGegevens(contactGegevens: ContactGegevens): boolean {
    // Als er geen email is, dan is het een anonieme melding (altijd geldig)
    if (!contactGegevens.email) {
      return true;
    }
    
    // Valideer email formaat
    return this.isGeldigEmail(contactGegevens.email);
  }
  
  /**
   * Slaat contactgegevens op voor later gebruik
   * 
   * @param contactGegevens De op te slaan contactgegevens
   * @returns Observable die true retourneert bij succes
   */
  saveContactGegevens(contactGegevens: ContactGegevens): Observable<boolean> {
    // In een echte implementatie zou dit naar een backend API gaan
    // Voor nu simuleren we een succesvolle opslag
    return of(true);
  }
  
  /**
   * Valideert email adres formaat
   * Gebruikt RFC 5322 compliant regex voor email validatie
   * 
   * @param email Het te valideren email adres
   * @returns true als email geldig is, false anders
   */
  private isGeldigEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }
}