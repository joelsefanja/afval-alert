import { Provider } from '@angular/core';
import { AFVAL_CLASSIFICATIE_SERVICE } from './afval-classificatie.token';
import { MockClassificatieService } from './afval-classificatie/mock-classificatie.service';
import { GeminiClassificatieService } from './afval-classificatie/gemini-classificatie.service';
import { ProductionClassificatieService } from './afval-classificatie/production-classificatie.service';

/**
 * Mock provider - Uses local mock data (no API calls)
 */
export const MOCK_AFVAL_CLASSIFICATIE_PROVIDER: Provider = {
  provide: AFVAL_CLASSIFICATIE_SERVICE,
  useClass: MockClassificatieService
};

/**
 * Development provider - Uses Gemini SDK directly
 * Good for development/testing with real AI
 */
export const GEMINI_AFVAL_CLASSIFICATIE_PROVIDER: Provider = {
  provide: AFVAL_CLASSIFICATIE_SERVICE,
  useClass: GeminiClassificatieService
};

/**
 * Production provider - Uses Python microservice
 * Production-ready with proper scaling and monitoring
 */
export const PRODUCTION_AFVAL_CLASSIFICATIE_PROVIDER: Provider = {
  provide: AFVAL_CLASSIFICATIE_SERVICE,
  useClass: ProductionClassificatieService
};

/**
 * Default providers for different environments
 */
export const AFVAL_CLASSIFICATIE_PROVIDERS = {
  mock: MOCK_AFVAL_CLASSIFICATIE_PROVIDER,
  development: GEMINI_AFVAL_CLASSIFICATIE_PROVIDER,
  production: PRODUCTION_AFVAL_CLASSIFICATIE_PROVIDER
};