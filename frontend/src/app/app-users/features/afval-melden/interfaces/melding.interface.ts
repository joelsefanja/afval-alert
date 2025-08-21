import { Observable } from 'rxjs';
import { MeldingConcept } from '../../../../models/melding-concept';
import { MeldingVerzendRequest, MeldingVerzendResponse } from '../../../../models/afval-herkenning';

export interface IMeldingService {
  /**
   * Haalt melding concept op uit sessie
   * @param meldingId ID van de melding
   * @returns Observable met melding concept
   */
  getMeldingConcept(meldingId: string): Observable<MeldingConcept | null>;

  /**
   * Slaat melding concept op in sessie
   * @param melding Melding concept om op te slaan
   * @returns Observable boolean voor success
   */
  slaaMeldingConceptOp(melding: MeldingConcept): Observable<boolean>;

  /**
   * Verzendt definitieve melding naar backend
   * @param request Melding verzend request
   * @returns Observable met verzend response
   */
  verzendMelding(request: MeldingVerzendRequest): Observable<MeldingVerzendResponse>;

  /**
   * Verwijdert melding concept uit sessie
   * @param meldingId ID van de melding
   * @returns Observable boolean voor success
   */
  verwijderMeldingConcept(meldingId: string): Observable<boolean>;
}

export interface Contact {
  email?: string;
  naam?: string;
  anoniem?: boolean;
}