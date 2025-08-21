import { Provider } from '@angular/core';
import { AFVAL_ALERT_TOKENS, DEFAULT_AFVAL_ALERT_TOKENS, AfvalAlertTokens } from './afval-alert.tokens';

/**
 * Environment-specific token configurations
 */

// Development tokens with extended logging
export const DEVELOPMENT_AFVAL_ALERT_TOKENS: AfvalAlertTokens = {
  ...DEFAULT_AFVAL_ALERT_TOKENS,
  // Add any development-specific overrides here
};

// Production tokens optimized for performance
export const PRODUCTION_AFVAL_ALERT_TOKENS: AfvalAlertTokens = {
  ...DEFAULT_AFVAL_ALERT_TOKENS,
  // Add any production-specific overrides here
};

// Test tokens for unit testing
export const TEST_AFVAL_ALERT_TOKENS: AfvalAlertTokens = {
  ...DEFAULT_AFVAL_ALERT_TOKENS,
  // Add any test-specific overrides here
};

// Removed complex providers - using simple MediaOrchestratorService
/**
 * Provider configurations for different environments
 */
export const AFVAL_ALERT_TOKENS_PROVIDER = {
  development: {
    provide: AFVAL_ALERT_TOKENS,
    useValue: DEVELOPMENT_AFVAL_ALERT_TOKENS
  } as Provider,
  
  production: {
    provide: AFVAL_ALERT_TOKENS,
    useValue: PRODUCTION_AFVAL_ALERT_TOKENS
  } as Provider,
  
  test: {
    provide: AFVAL_ALERT_TOKENS,
    useValue: TEST_AFVAL_ALERT_TOKENS
  } as Provider,
  
  // Default provider (same as development)
  default: {
    provide: AFVAL_ALERT_TOKENS,
    useValue: DEFAULT_AFVAL_ALERT_TOKENS
  } as Provider
};