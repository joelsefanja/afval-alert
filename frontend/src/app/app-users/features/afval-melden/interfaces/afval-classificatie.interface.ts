/**
 * Afval classificatie types en interfaces
 */

export interface AfvalTypeConfidence {
  afval_type: string;
  confidence: number; // 0.0 - 1.0, alleen > 0.0 worden gereturned
}

export interface AfvalClassificatieResponse {
  afval_typen: AfvalTypeConfidence[];
}

/**
 * Interface voor afval classificatie services
 * Ondersteunt verschillende AI providers (Gemini, custom APIs, etc.)
 */
export interface IAfvalClassificatieService {
  /**
   * Classificeer afval op basis van foto blob
   * @param fotoBlob - De foto als Blob
   * @returns Promise met classificatie resultaten
   */
  classificeerAfval(fotoBlob: Blob): Promise<AfvalClassificatieResponse>;
}

/**
 * Deprecated - backwards compatibility
 * @deprecated Use AfvalClassificatieResponse instead
 */
export interface DetectieResultaat {
  afvalTypes: string[];
  betrouwbaarheid: number;
  suggestie?: string;
}