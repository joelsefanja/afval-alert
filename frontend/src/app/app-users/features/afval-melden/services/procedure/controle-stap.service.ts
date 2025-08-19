import { Injectable, inject, computed } from '@angular/core';
import { MeldingStateService } from '../melding';
import { StepBuilderService } from '../steps/step-builder.service';

export interface MeldingOverzicht {
  fotoUrl?: string;
  locatie?: string;
  contactNaam?: string;
  contactEmail?: string;
  isAnoniem: boolean;
}

/**
 * ControleStapService - Service voor controle stap logica
 * 
 * Verantwoordelijkheden:
 * - Melding data aggregatie
 * - Validatie van complete melding
 * - Verzending voorbereiding
 * - Overzicht generatie
 * 
 * @example
 * ```typescript
 * constructor(private controleService: ControleStapService) {}
 * 
 * verstuurMelding() {
 *   if (this.controleService.isComplete()) {
 *     this.controleService.submit();
 *   }
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class ControleStapService {
  private meldingState = inject(MeldingStateService);
  
  constructor(
    private meldingService: MeldingStateService,
    private stepBuilder: StepBuilderService
  ) {}
  
  readonly overzicht = computed((): MeldingOverzicht => {
    const data = this.meldingState.meldingData();
    return {
      fotoUrl: data.foto as string | undefined,
      locatie: data.locatie?.address as string | undefined,
      contactNaam: data.contact?.naam as string | undefined,
      contactEmail: data.contact?.email as string | undefined,
      isAnoniem: data.contact?.anoniem || false
    };
  });
  
  readonly isComplete = computed(() => {
    const data = this.meldingState.meldingData();
    return !!(data.foto && data.locatie);
  });

  prev(): void {
    this.stepBuilder.prev();
  }

  submit(): void {
    if (!this.isComplete()) {
      console.error('Melding is niet compleet');
      return;
    }
    
    // Hier zou normaal de API call plaatsvinden
    console.log('Melding verzonden:', this.overzicht());
    this.stepBuilder.next();
  }

  editFoto(): void {
    this.stepBuilder.goto(1); // Ga naar foto stap
  }

  editLocatie(): void {
    this.stepBuilder.goto(2); // Ga naar locatie stap
  }

  editContact(): void {
    this.stepBuilder.goto(3); // Ga naar contact stap
  }
}