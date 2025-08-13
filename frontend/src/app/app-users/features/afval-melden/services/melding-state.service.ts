import { Injectable, computed, signal } from '@angular/core';
import { ContactInfo } from '../components/contact-stap/contact-stap.component';

export enum AfvalMeldProcedureStap {
  START = 0,
  FOTO = 1,
  LOCATIE = 2,
  CONTACT = 3,
  CONTROLE = 4,
  SUCCES = 5
}

@Injectable({
  providedIn: 'root'
})
export class MeldingState {
  private _huidigeStap = signal<number>(AfvalMeldProcedureStap.START);
  private _fotoUrl = signal<string>('');
  private _fotoError = signal<string>('');
  private _locatieAdres = signal<string>('');
  private _locatieCoordinaten = signal<{ lat: number; lng: number } | null>(null);
  private _locatieBuitenGroningen = signal<boolean>(false);
  private _locatieError = signal<string>('');
  private _contactInfo = signal<ContactInfo>({});
  private _emailError = signal<string>('');
  private _isOffline = signal<boolean>(false);
  private _isVerzenden = signal<boolean>(false);
  
  // Computed signals
  readonly currentStep = computed(() => this._huidigeStap());
  readonly fotoUrl = computed(() => this._fotoUrl());
  readonly fotoError = computed(() => this._fotoError());
  readonly locatieAdres = computed(() => this._locatieAdres());
  readonly locatieCoordinaten = computed(() => this._locatieCoordinaten());
  readonly locatieBuitenGroningen = computed(() => this._locatieBuitenGroningen());
  readonly locatieError = computed(() => this._locatieError());
  readonly contactInfo = computed(() => this._contactInfo());
  readonly emailError = computed(() => this._emailError());
  readonly isOffline = computed(() => this._isOffline());
  readonly isVerzenden = computed(() => this._isVerzenden());
  
  // Computed signals voor validatie
  readonly isFotoValid = computed(() => !!this._fotoUrl());
  readonly isLocatieValid = computed(() => 
    !!this._locatieAdres() && 
    !!this._locatieCoordinaten() && 
    !this._locatieBuitenGroningen()
  );
  readonly isContactValid = computed(() => !this._emailError());
  readonly canProceedToNext = computed(() => {
    const currentStep = this._huidigeStap();
    
    switch (currentStep) {
      case AfvalMeldProcedureStap.START:
        return true;
      case AfvalMeldProcedureStap.FOTO:
        return this.isFotoValid();
      case AfvalMeldProcedureStap.LOCATIE:
        return this.isLocatieValid();
      case AfvalMeldProcedureStap.CONTACT:
        return this.isContactValid();
      case AfvalMeldProcedureStap.CONTROLE:
        return !this._isVerzenden() && !this._isOffline();
      default:
        return true;
    }
  });
  
  /**
   * Zet de huidige stap index
   * @param index De nieuwe stap index
   */
  setCurrentStepIndex(index: number): void {
    this._huidigeStap.set(index);
  }

  /**
   * Ga naar de volgende stap (state machine)
   */
  gaNaarVolgende(): void {
    const currentStep = this._huidigeStap();
    if (currentStep < AfvalMeldProcedureStap.SUCCES) {
      this._huidigeStap.set(currentStep + 1);
    }
  }

  /**
   * Ga terug naar de vorige stap
   */
  gaTerugNaarVorige(): void {
    const currentStep = this._huidigeStap();
    if (currentStep > AfvalMeldProcedureStap.FOTO) {
      this._huidigeStap.set(currentStep - 1);
    }
  }

  /**
   * Ga terug naar de start voor aanpassingen
   */
  gaTerugNaarStart(): void {
    this._huidigeStap.set(AfvalMeldProcedureStap.FOTO);
  }

  /**
   * Check of er een vorige stap is
   */
  readonly heeftVorigeStap = computed(() => 
    this._huidigeStap() > AfvalMeldProcedureStap.FOTO
  );
  
  /**
   * Zet de foto URL
   * @param url De nieuwe foto URL
   */
  setFotoUrl(url: string): void {
    this._fotoUrl.set(url);
    this._fotoError.set('');
  }
  
  /**
   * Zet de foto foutmelding
   * @param error De foutmelding
   */
  setFotoError(error: string): void {
    this._fotoError.set(error);
  }
  
  /**
   * Zet de locatie gegevens
   * @param adres Het adres van de locatie
   * @param coordinaten De coördinaten van de locatie
   * @param buitenGroningen Of de locatie buiten Groningen ligt
   */
  setLocatie(adres: string, coordinaten: { lat: number; lng: number }, buitenGroningen: boolean): void {
    this._locatieAdres.set(adres);
    this._locatieCoordinaten.set(coordinaten);
    this._locatieBuitenGroningen.set(buitenGroningen);
    this._locatieError.set('');
  }
  
  /**
   * Zet de locatie foutmelding
   * @param error De foutmelding
   */
  setLocatieError(error: string): void {
    this._locatieError.set(error);
  }
  
  /**
   * Zet de contactgegevens
   * @param contactInfo De nieuwe contactgegevens
   */
  setContactInfo(contactInfo: ContactInfo): void {
    this._contactInfo.set(contactInfo);
    
    // Valideer e-mail
    if (contactInfo.email) {
      this.validateEmail(contactInfo.email);
    } else {
      this._emailError.set('');
    }
  }
  
  /**
   * Zet de offline status
   * @param isOffline Of de gebruiker offline is
   */
  setOfflineStatus(isOffline: boolean): void {
    this._isOffline.set(isOffline);
  }
  
  /**
   * Zet de verzenden status
   * @param isVerzenden Of er momenteel een verzendactie bezig is
   */
  setVerzenden(isVerzenden: boolean): void {
    this._isVerzenden.set(isVerzenden);
  }
  
  /**
   * Reset de afval meld procedure state
   */
  resetState(): void {
    this._huidigeStap.set(AfvalMeldProcedureStap.START);
    this._fotoUrl.set('');
    this._fotoError.set('');
    this._locatieAdres.set('');
    this._locatieCoordinaten.set(null);
    this._locatieBuitenGroningen.set(false);
    this._locatieError.set('');
    this._contactInfo.set({});
    this._emailError.set('');
    this._isVerzenden.set(false);
  }
  
  /**
   * Valideer een e-mailadres
   * @param email Het e-mailadres om te valideren
   * @returns Of het e-mailadres geldig is
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