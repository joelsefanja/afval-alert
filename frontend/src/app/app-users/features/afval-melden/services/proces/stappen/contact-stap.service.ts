import { Injectable, signal, computed, inject } from '@angular/core';
import { ProcesStapValidatie } from '@interfaces/proces-stap-validatie.interface';
import { AfvalMeldingStateService } from '@services/melding';   
import { ProcesNavigatorService } from '@services/proces/navigatie';
import validator from 'validator';
import { ContactGegevensDto } from '@services/melding/dto/frontend.dto';

@Injectable({ providedIn: 'root' })
export class ContactStapService implements ProcesStapValidatie {
  private afvalMeldingService = inject(AfvalMeldingStateService);
  private navigator = inject(ProcesNavigatorService);

  readonly naam = signal('');
  readonly email = signal('');
  readonly anoniem = signal(false);

  readonly isEmailGeldig = computed(() => validator.isEmail(this.email()) || this.anoniem());
  readonly isEmailValid = computed(() => this.isEmailGeldig());
  readonly isFormulierGeldig = computed(() => this.anoniem() || (!!this.naam().trim() && this.isEmailGeldig()));
  readonly isFormValid = computed(() => this.isFormulierGeldig());
  readonly kanDoorgaan = computed(() => true);

  isGeldig(): boolean { return true; }

  setNaam(naam: string): void {
    this.naam.set(naam);
  }

  setEmail(email: string): void {
    this.email.set(email);
  }

  setAnoniem(anoniem: boolean): void {
    this.anoniem.set(anoniem);
    if (anoniem) {
      this.naam.set('');
      this.email.set('');
    }
  }

  prev(): void {
    this.opslaan();
    this.navigator.vorige();
  }

  saveAndNext(): void {
    this.opslaan();
    this.navigator.volgende();
  }

  skipAndNext(): void {
    this.setAnoniem(true);
    this.opslaan();
    this.navigator.volgende();
  }

  opslaan(): void {
    this.afvalMeldingService.plaatsContactGegevens({
      naam: this.anoniem() ? undefined : this.naam() || undefined,
      email: this.anoniem() ? undefined : this.email() || undefined,
      anoniem: this.anoniem()
    });
  }
}
