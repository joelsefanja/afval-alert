import { Injectable, computed, signal, inject } from '@angular/core';
import { MeldingConcept, MeldingConceptStatus } from '../../../../../models/melding-concept';
import { AfvalType } from '../../../../../models/afval-herkenning';
import { IMeldingService } from '../../interfaces/melding.interface';
import { MeldingMockService } from './melding-mock.service';

export enum AfvalMeldProcedureStap {
  START = 0,
  FOTO = 1,
  FOTO_VERWERKING = 2,
  LOCATIE = 3,
  CONTACT = 4,
  CONTROLE = 5,
  VERZENDEN = 6,
  SUCCES = 7
}

@Injectable({
  providedIn: 'root'
})
export class MeldingsProcedureStatus {
  private meldingService: IMeldingService = inject(MeldingMockService);

  // State signals
  private _huidigeStap = signal<number>(AfvalMeldProcedureStap.START);
  private _meldingConcept = signal<MeldingConcept | null>(null);
  private _fotoUrl = signal<string>('');
  private _fotoError = signal<string>('');
  private _verwerkingActief = signal<boolean>(false);
  private _locatieError = signal<string>('');
  private _emailError = signal<string>('');
  private _isOffline = signal<boolean>(false);
  private _isVerzenden = signal<boolean>(false);
  private _verzendError = signal<string>('');
  
  // Computed signals
  readonly huidigeStap = computed(() => this._huidigeStap());
  readonly meldingConcept = computed(() => this._meldingConcept());
  readonly fotoUrl = computed(() => this._fotoUrl());
  readonly fotoError = computed(() => this._fotoError());
  readonly verwerkingActief = computed(() => this._verwerkingActief());
  readonly locatieError = computed(() => this._locatieError());
  readonly emailError = computed(() => this._emailError());
  readonly isOffline = computed(() => this._isOffline());
  readonly isVerzenden = computed(() => this._isVerzenden());
  readonly verzendError = computed(() => this._verzendError());
  
  // Computed signals voor melding data
  readonly afvalTypes = computed(() => this._meldingConcept()?.afvalTypes || []);
  readonly weetje = computed(() => this._meldingConcept()?.weetje || '');
  readonly locatieAdres = computed(() => this._meldingConcept()?.locatie?.adres || '');
  readonly locatieCoordinaten = computed(() => this._meldingConcept()?.locatie ? 
    { lat: this._meldingConcept()!.locatie!.latitude, lng: this._meldingConcept()!.locatie!.longitude } : null
  );
  readonly contactInfo = computed(() => this._meldingConcept()?.contact || {});
  
  // Computed signals voor validatie
  readonly isFotoVerwerkt = computed(() => {
    const concept = this._meldingConcept();
    return concept && concept.status >= MeldingConceptStatus.AFBEELDING_VERWERKT;
  });
  readonly isLocatieAanwezig = computed(() => {
    const concept = this._meldingConcept();
    return concept && concept.locatie && concept.locatie.latitude && concept.locatie.longitude;
  });
  readonly isContactInfoGeldig = computed(() => !this._emailError());
  readonly magNaarVolgendeStap = computed(() => {
    const huidigeStap = this._huidigeStap();
    
    switch (huidigeStap) {
      case AfvalMeldProcedureStap.START:
        return true;
      case AfvalMeldProcedureStap.FOTO:
        return !!this._fotoUrl();
      case AfvalMeldProcedureStap.FOTO_VERWERKING:
        return this.isFotoVerwerkt();
      case AfvalMeldProcedureStap.LOCATIE:
        return this.isLocatieAanwezig();
      case AfvalMeldProcedureStap.CONTACT:
        return this.isContactInfoGeldig();
      case AfvalMeldProcedureStap.CONTROLE:
        return !this._isVerzenden() && !this._isOffline();
      default:
        return true;
    }
  });
  
  /**
   * Zet de huidige stap
   */
  setHuidigeStap(stap: number): void {
    this._huidigeStap.set(stap);
  }

  /**
   * Ga naar de volgende stap (state machine)
   */
  gaNaarVolgende(): void {
    const huidigeStap = this._huidigeStap();
    if (huidigeStap < AfvalMeldProcedureStap.SUCCES) {
      this._huidigeStap.set(huidigeStap + 1);
    }
  }

  /**
   * Ga terug naar de vorige stap
   */
  gaTerugNaarVorige(): void {
    const huidigeStap = this._huidigeStap();
    if (huidigeStap > AfvalMeldProcedureStap.START) {
      // Skip foto verwerking stap bij teruggaan
      if (huidigeStap === AfvalMeldProcedureStap.LOCATIE) {
        this._huidigeStap.set(AfvalMeldProcedureStap.FOTO);
      } else {
        this._huidigeStap.set(huidigeStap - 1);
      }
    }
  }

  /**
   * Check of er een vorige stap is
   */
  readonly heeftVorigeStap = computed(() => 
    this._huidigeStap() > AfvalMeldProcedureStap.START
  );

  /**
   * Zet melding concept na afbeelding verwerking
   */
  setMeldingConcept(concept: MeldingConcept): void {
    this._meldingConcept.set(concept);
    this.meldingService.slaaMeldingConceptOp(concept).subscribe();
  }

  /**
   * Start foto verwerking
   */
  startFotoVerwerking(): void {
    this._verwerkingActief.set(true);
    this._fotoError.set('');
    this.setHuidigeStap(AfvalMeldProcedureStap.FOTO_VERWERKING);
  }

  /**
   * Voltooi foto verwerking
   */
  voltooiFotoVerwerking(concept: MeldingConcept): void {
    this._verwerkingActief.set(false);
    this.setMeldingConcept(concept);
    this.setHuidigeStap(AfvalMeldProcedureStap.LOCATIE);
  }
  
  /**
   * Zet de foto URL
   */
  setFotoUrl(url: string): void {
    this._fotoUrl.set(url);
    this._fotoError.set('');
  }
  
  /**
   * Zet de foto foutmelding
   */
  setFotoError(error: string): void {
    this._fotoError.set(error);
    this._verwerkingActief.set(false);
  }
  
  /**
   * Zet de locatie gegevens
   */
  setLocatie(adres: string, coordinaten: { lat: number; lng: number }): void {
    const concept = this._meldingConcept();
    if (concept) {
      const updatedConcept: MeldingConcept = {
        ...concept,
        locatie: {
          latitude: coordinaten.lat,
          longitude: coordinaten.lng,
          adres
        },
        status: MeldingConceptStatus.LOCATIE_TOEGEVOEGD
      };
      this.setMeldingConcept(updatedConcept);
    }
    this._locatieError.set('');
  }
  
  /**
   * Zet de locatie foutmelding
   */
  setLocatieError(error: string): void {
    this._locatieError.set(error);
  }
  
  /**
   * Zet de contactgegevens
   */
  setContactInfo(contactInfo: { email?: string; naam?: string; telefoon?: string }): void {
    const concept = this._meldingConcept();
    if (concept) {
      const updatedConcept: MeldingConcept = {
        ...concept,
        contact: contactInfo,
        status: MeldingConceptStatus.CONTACT_TOEGEVOEGD
      };
      this.setMeldingConcept(updatedConcept);
    }
    
    // Valideer e-mail
    if (contactInfo.email) {
      this.validateEmail(contactInfo.email);
    } else {
      this._emailError.set('');
    }
  }
  
  /**
   * Zet de offline status
   */
  setOfflineStatus(isOffline: boolean): void {
    this._isOffline.set(isOffline);
  }
  
  /**
   * Zet de verzenden status
   */
  setVerzenden(isVerzenden: boolean): void {
    this._isVerzenden.set(isVerzenden);
  }

  /**
   * Zet verzend error
   */
  setVerzendError(error: string): void {
    this._verzendError.set(error);
    this._isVerzenden.set(false);
  }
  
  /**
   * Reset de afval meld procedure state
   */
  resetState(): void {
    this._huidigeStap.set(AfvalMeldProcedureStap.START);
    this._meldingConcept.set(null);
    this._fotoUrl.set('');
    this._fotoError.set('');
    this._verwerkingActief.set(false);
    this._locatieError.set('');
    this._emailError.set('');
    this._isVerzenden.set(false);
    this._verzendError.set('');
  }
  
  /**
   * Valideer een e-mailadres
   */
  private validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValid = emailRegex.test(email);
    
    if (!isValid && email) {
      this._emailError.set('Voer een geldig e-mailadres in');
    } else {
      this._emailError.set('');
    }
    
    return isValid;
  }
}