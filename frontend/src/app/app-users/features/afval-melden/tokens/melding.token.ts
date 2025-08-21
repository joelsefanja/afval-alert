import { InjectionToken } from '@angular/core';
import { IMeldingService } from '../interfaces/melding.interface';

/**
 * Injection token voor de melding service
 */
export const MELDING_SERVICE_TOKEN = new InjectionToken<IMeldingService>('IMeldingService');