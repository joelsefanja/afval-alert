/**
 * Barrel export voor alle model types.
 * Hiermee kunnen alle models geïmporteerd worden vanuit één plek.
 */

// Basis types
export { AfvalType } from './afval-type';
export { AfvalMeldingStatus } from './melding-status';
export type { Locatie } from './locatie';
export type { Contact } from './contact';

// Samengestelde types
export type { Melding } from './melding';