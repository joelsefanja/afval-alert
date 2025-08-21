import { AfvalType } from './afval-type';

export interface MeldingConcept {
  id: string;
  afbeeldingUrl: string;
  afvalTypes: AfvalType[];
  weetje: string;
  locatie?: {
    latitude: number;
    longitude: number;
    adres?: string;
  };
  contact?: {
    email?: string;
    naam?: string;
    telefoon?: string;
  };
  status: MeldingConceptStatus;
  aanmaakDatum: Date;
}

export enum MeldingConceptStatus {
  CONCEPT = 'CONCEPT',
  AFBEELDING_VERWERKT = 'AFBEELDING_VERWERKT',
  LOCATIE_TOEGEVOEGD = 'LOCATIE_TOEGEVOEGD',
  CONTACT_TOEGEVOEGD = 'CONTACT_TOEGEVOEGD',
  KLAAR_VOOR_VERZENDEN = 'KLAAR_VOOR_VERZENDEN',
  VERZONDEN = 'VERZONDEN'
}