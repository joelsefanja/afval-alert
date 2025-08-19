import { Injectable, signal } from '@angular/core';

export enum AfvalMeldProcedureStap {
  START,
  FOTO,
  CLASSIFICATIE,
  LOCATIE,
  CONTACT,
  CONTROLE,
  VERZENDEN,
  SUCCES
}

export class MeldingsProcedureStatus {
  public huidigeStap = signal<AfvalMeldProcedureStap>(AfvalMeldProcedureStap.START);
  public fotoUrl = signal<string>('');
  public fotoError = signal<string>('');
  public locatieCoordinaten = signal<{ lat: number; long: number } | null>(null);
  public locatieAdres = signal<string>('');
  public contactInfo = signal<{ naam?: string; email?: string; anoniem?: boolean }>({});
  public verzendStatus = signal<boolean>(false);
  public verzendError = signal<string>('');
  public meldingConcept = signal<any>(null);
  public weetje: () => string | undefined = () => undefined;
  public afvalTypes: () => any[] = () => [];
  public voltooiFotoVerwerking: (concept: any) => void = (concept: any) => {};

  gaNaarVolgende = () => {
    this.huidigeStap.update((value) => {
      return value + 1;
    });
  }

  gaTerugNaarVorige = () => {
    this.huidigeStap.update((value) => {
      return value - 1;
    });
  }

  setHuidigeStap = (stap: number) => {
    this.huidigeStap.set(stap);
  }

  setFotoUrl = (url: string) => {
    this.fotoUrl.set(url);
  }

  setFotoError = (error: string) => {
    this.fotoError.set(error);
  }

  setLocatie = (adres: string, lat: number, long: number) => {
    this.locatieCoordinaten.set({ lat, long });
    this.setLocatieAdres(adres);
  }

  setLocatieAdres = (adres: string) => {
    this.locatieAdres.set(adres);
  }

  setContactInfo = (contactInfo: any) => {
    this.contactInfo.set(contactInfo);
  }

  setVerzenden = (status: boolean) => {
    this.verzendStatus.set(status);
  }

  setVerzendError = (error: string) => {
    this.verzendError.set(error);
  }

  resetState = () => {
    this.huidigeStap.set(AfvalMeldProcedureStap.START);
    this.fotoUrl.set('');
    this.fotoError.set('');
    this.locatieCoordinaten.set(null);
    this.locatieAdres.set('');
    this.contactInfo.set({});
    this.verzendStatus.set(false);
    this.verzendError.set('');
    this.meldingConcept.set(null);
  }
}

export interface MeldingData {
  foto?: string;
  locatie?: { address: string; lat: number; lng: number };
  contact?: { naam?: string; email?: string; anoniem?: boolean };
}

@Injectable({ providedIn: 'root' })
export class MeldingStateService {
  private data = signal<MeldingData>({});

  readonly meldingData = this.data.asReadonly();

  setFoto(foto: string) {
    this.data.update(d => ({ ...d, foto }));
  }

  setLocatie(address: string, lat: number, lng: number) {
    this.data.update(d => ({ ...d, locatie: { address, lat, lng } }));
  }

  setContact(naam?: string, email?: string, anoniem = false) {
    this.data.update(d => ({ ...d, contact: { naam, email, anoniem } }));
  }

  reset() {
    this.data.set({});
  }
}