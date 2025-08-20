import { AfvalType } from './afval-herkenning';

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

import { FotoHerkenningResultaat } from '@app/app-users/features/afval-melden/interfaces/foto-verwerking.interface';

export interface MeldingConcept {
  fotoHerkenningResultaat?: FotoHerkenningResultaat;
}

export enum MeldingConceptStatus {
  CONCEPT = 'CONCEPT',
  AFBEELDING_VERWERKT = 'AFBEELDING_VERWERKT',
  LOCATIE_TOEGEVOEGD = 'LOCATIE_TOEGEVOEGD',
  CONTACT_TOEGEVOEGD = 'CONTACT_TOEGEVOEGD',
  KLAAR_VOOR_VERZENDEN = 'KLAAR_VOOR_VERZENDEN',
  VERZONDEN = 'VERZONDEN'
}