import { Injectable } from '@angular/core';
import { AfvalTypeConfidence } from '../../interfaces/afval-classificatie.interface';

/**
 * Session storage service
 * Handles session storage operations with type safety
 */
@Injectable({ providedIn: 'root' })
export class SessieStorageService {
  
  /**
   * Save data to session storage
   * @param key The key to save the data under
   * @param data The data to save (will be JSON stringified)
   */
  save<T>(key: string, data: T): void {
    if (typeof sessionStorage === 'undefined') return;
    
    try {
      const jsonData = JSON.stringify(data);
      sessionStorage.setItem(key, jsonData);
    } catch (error) {
      console.error('Error saving to session storage:', error);
    }
  }
  
  /**
   * Load data from session storage
   * @param key The key to load data from
   * @returns The parsed data or null if not found
   */
  load<T>(key: string): T | null {
    if (typeof sessionStorage === 'undefined') return null;
    
    try {
      const jsonData = sessionStorage.getItem(key);
      return jsonData ? JSON.parse(jsonData) : null;
    } catch (error) {
      console.error('Error loading from session storage:', error);
      return null;
    }
  }
  
  /**
   * Remove data from session storage
   * @param key The key to remove
   */
  remove(key: string): void {
    if (typeof sessionStorage === 'undefined') return;
    
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from session storage:', error);
    }
  }
  
  /**
   * Clear all session storage
   */
  clear(): void {
    if (typeof sessionStorage === 'undefined') return;
    
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing session storage:', error);
    }
  }
  
  /**
   * Check if a key exists in session storage
   * @param key The key to check
   * @returns True if the key exists, false otherwise
   */
  exists(key: string): boolean {
    if (typeof sessionStorage === 'undefined') return false;
    
    return sessionStorage.getItem(key) !== null;
  }
  
  // Specifieke methoden voor afval melding
  
  /**
   * Sla classificatie resultaten op voor een melding
   * @param meldingId De ID van de melding
   * @param afvalTypen De geclassificeerde afval typen
   */
  slaClassificatieOp(meldingId: string, afvalTypen: AfvalTypeConfidence[]): void {
    this.save(`classificatie_${meldingId}`, afvalTypen);
  }
  
  /**
   * Haal classificatie resultaten op voor een melding
   * @param meldingId De ID van de melding
   * @returns De geclassificeerde afval typen of null
   */
  krijgClassificatie(meldingId: string): AfvalTypeConfidence[] | null {
    return this.load<AfvalTypeConfidence[]>(`classificatie_${meldingId}`);
  }
  
  /**
   * Sla melding UUID op
   * @param meldingId De UUID van de huidige melding
   */
  slaMeldingIdOp(meldingId: string): void {
    this.save('huidige_melding_id', meldingId);
  }
  
  /**
   * Krijg huidige melding UUID
   * @returns De UUID van de huidige melding of null
   */
  krijgMeldingId(): string | null {
    return this.load<string>('huidige_melding_id');
  }
  
  /**
   * Genereer en sla nieuwe melding UUID op
   * @returns Nieuwe melding UUID
   */
  genereeerNieuweMeldingId(): string {
    const uuid = this.genereerId();
    this.slaMeldingIdOp(uuid);
    return uuid;
  }
  
  /**
   * Genereer unieke ID
   */
  private genereerId(): string {
    return `melding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}