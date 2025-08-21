// Frontend DTOs (for UI display and internal state)
export interface ContactGegevensDto {
  naam?: string;
  email?: string;
  anoniem?: boolean;
}

export interface LocatieGegevensDto {
  adres: string; 
  breedtegraad: number; 
  lengtegraad: number;
}

export interface AfvalMeldingConceptDto {
  conceptId?: string;
  locatie?: LocatieGegevensDto;
  contact?: ContactGegevensDto;
  afbeeldingUrl?: string;
  afvalTypes?: any[];
}