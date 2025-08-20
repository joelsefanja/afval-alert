import { Observable } from 'rxjs';
import { AfvalType } from '@app/models/afval-herkenning';

export interface FotoVerwerkingMetadata {
  geminiModel: string;
  analyseDatum: string;
  validatieType?: string;
  afvalGedetecteerd: boolean;
  hoogsteZekerheid: number;
  foutOpgetreden?: boolean;
}

export interface FotoVerwerkingResultaat {
  afvalTypes: AfvalType[];
  weetje: string;
}

import { AfvalTypeDetectie } from './gemini-response.interface';

export interface FotoHerkenningResultaat {
  afvalTypes: AfvalTypeDetectie[];
  weetje: string;
  isAfval?: boolean;
  kenmerken?: string[];
  zekerheidsScores?: number[];
  metadata?: FotoVerwerkingMetadata;
}

export interface IFotoVerwerkingService {
  /**
   * Verwerkt een foto en herkent afval types met Gemini AI
   */
  verwerkFoto(fotoBlob: Blob): Observable<FotoVerwerkingResultaat>;
  
  /**
   * Controleert of de service beschikbaar is
   */
  isServiceBeschikbaar(): Observable<boolean>;
}