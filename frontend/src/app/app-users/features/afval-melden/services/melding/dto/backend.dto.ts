// Backend DTOs (for API communication)
export interface LocatieVoorBackendDto {
  breedtegraad: number;
  lengtegraad: number;
}

export interface AfvalMeldingVoorBackendDto {
  conceptId: string;
  locatie: LocatieVoorBackendDto;
  contact: {
    naam?: string;
    email?: string;
    anoniem?: boolean;
  };
}