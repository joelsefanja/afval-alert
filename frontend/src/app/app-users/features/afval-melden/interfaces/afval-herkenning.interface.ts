import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { AfbeeldingUploadRequest, AfbeeldingUploadResponse } from '../../../../models/afval-herkenning';

/**
 * Injection token voor de afval herkenning service
 */
export const AFVAL_HERKENNING_SERVICE_TOKEN = new InjectionToken<IAfvalHerkenningService>('IAfvalHerkenningService');

export interface IAfvalHerkenningService {
  /**
   * Stuurt afbeelding naar AI service voor herkenning
   * @param request Afbeelding upload request
   * @returns Observable met herkenningsresultaat en melding ID
   */
  uploadEnHerkenAfbeelding(request: AfbeeldingUploadRequest): Observable<AfbeeldingUploadResponse>;

  /**
   * Controleert of de service beschikbaar is
   * @returns Observable boolean
   */
  isServiceBeschikbaar(): Observable<boolean>;
}