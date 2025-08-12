import { Injectable } from '@angular/core';
import { AfvalMelding, AfvalMeldingStatus } from '@app/models/afval-melding.model';
import { AfvalType } from '@app/models/afval-type.model';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Service voor het beheren van afvalmeldingen.
 * Deze service houdt de huidige melding bij en biedt functionaliteit voor het
 * aanmaken, bijwerken, verzenden en annuleren van meldingen.
 */
@Injectable({
  providedIn: 'root'
})
export class MeldingService {
  // Maximale tijd in milliseconden dat een melding geldig blijft (30 minuten)
  private readonly MELDING_TIMEOUT = 30 * 60 * 1000;
  
  // BehaviorSubject voor de huidige melding
  private currentMeldingSubject = new BehaviorSubject<AfvalMelding | null>(null);
  
  // Observable voor de huidige melding
  public currentMelding$ = this.currentMeldingSubject.asObservable();
  
  // Timeout ID voor het automatisch verwijderen van verlopen meldingen
  private timeoutId: any = null;
  
  constructor() {}
  
  /**
   * Maakt een nieuwe conceptmelding aan op basis van een foto en gedetecteerde afvaltypes.
   * 
   * @param fotoBlob - De foto als Blob object
   * @param afvalTypes - De gedetecteerde afvaltypes
   * @returns De aangemaakte melding
   */
  createMelding(fotoBlob: Blob, afvalTypes: AfvalType[]): AfvalMelding {
    // Annuleer eventuele bestaande timeout
    this.clearTimeout();
    
    // Genereer een unieke ID
    const id = this.generateUniqueId();
    
    // Maak een nieuwe melding
    const melding: AfvalMelding = {
      id,
      fotoBlob,
      afvalTypes,
      tijdstipCreatie: new Date(),
      status: AfvalMeldingStatus.CONCEPT
    };
    
    // Update de huidige melding
    this.currentMeldingSubject.next(melding);
    
    // Stel een timeout in voor het automatisch verwijderen van de melding
    this.setExpirationTimeout();
    
    return melding;
  }
  
  /**
   * Werkt de locatie van de huidige melding bij.
   * 
   * @param latitude - De breedtegraad
   * @param longitude - De lengtegraad
   * @returns De bijgewerkte melding of null als er geen huidige melding is
   */
  updateLocation(latitude: number, longitude: number): AfvalMelding | null {
    const currentMelding = this.currentMeldingSubject.value;
    
    if (!currentMelding) {
      return null;
    }
    
    // Update de locatie
    const updatedMelding: AfvalMelding = {
      ...currentMelding,
      locatie: { latitude, longitude }
    };
    
    // Update de huidige melding
    this.currentMeldingSubject.next(updatedMelding);
    
    return updatedMelding;
  }
  
  /**
   * Markeert de huidige melding als verzonden.
   * 
   * @returns De verzonden melding of null als er geen huidige melding is
   */
  markeerMeldingAlsVerzonden(): AfvalMelding | null {
    const currentMelding = this.currentMeldingSubject.value;
    
    if (!currentMelding) {
      return null;
    }
    
    // Annuleer de timeout
    this.clearTimeout();
    
    // Update de status
    const updatedMelding: AfvalMelding = {
      ...currentMelding,
      status: AfvalMeldingStatus.VERZONDEN,
      tijdstipVerzonden: new Date()
    };
    
    // Update de huidige melding
    this.currentMeldingSubject.next(updatedMelding);
    
    return updatedMelding;
  }
  
  /**
   * Annuleert de huidige melding.
   */
  cancelMelding(): void {
    const currentMelding = this.currentMeldingSubject.value;
    
    if (!currentMelding) {
      return;
    }
    
    // Annuleer de timeout
    this.clearTimeout();
    
    // Update de status
    const updatedMelding: AfvalMelding = {
      ...currentMelding,
      status: AfvalMeldingStatus.GEANNULEERD
    };
    
    // Update de huidige melding en reset daarna
    this.currentMeldingSubject.next(updatedMelding);
    setTimeout(() => this.currentMeldingSubject.next(null), 100);
  }
  
  /**
   * Reset de huidige melding.
   */
  resetMelding(): void {
    // Annuleer de timeout
    this.clearTimeout();
    
    // Reset de huidige melding
    this.currentMeldingSubject.next(null);
  }
  
  /**
   * Genereert een unieke ID voor een melding.
   * 
   * @returns Een unieke ID
   */
  private generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
  
  /**
   * Stelt een timeout in voor het automatisch verwijderen van de melding.
   */
  private setExpirationTimeout(): void {
    this.timeoutId = setTimeout(() => {
      const currentMelding = this.currentMeldingSubject.value;
      
      if (currentMelding && currentMelding.status === AfvalMeldingStatus.CONCEPT) {
        // Update de status
        const updatedMelding: AfvalMelding = {
          ...currentMelding,
          status: AfvalMeldingStatus.VERLOPEN
        };
        
        // Update de huidige melding en reset daarna
        this.currentMeldingSubject.next(updatedMelding);
        setTimeout(() => this.currentMeldingSubject.next(null), 100);
      }
    }, this.MELDING_TIMEOUT);
  }
  
  /**
   * Annuleert de huidige timeout.
   */
  private clearTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}