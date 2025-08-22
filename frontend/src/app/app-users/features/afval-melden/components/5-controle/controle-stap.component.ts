import { Component, inject, computed, signal } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { NavigatieService } from '../../services/navigatie/navigatie.service';
import { MeldingConceptService } from '../../services/melding/concept/melding-concept.service';
import { MeldingVerzendingService } from '../../services/melding/verzending/melding-verzending.service';
import { SessieStorageService } from '../../services/opslag/sessie-storage.service';
import { NavigatieKnoppenComponent } from '../shared/navigatie-knoppen/navigatie-knoppen.component';
import { MeldingOverzichtComponent } from './components/melding-overzicht/melding-overzicht.component';
import { FotoSamenvattingComponent } from './components/foto-samenvatting/foto-samenvatting.component';
import { ContactSamenvattingComponent } from './components/contact-samenvatting/contact-samenvatting.component';
import { FotoUploadService } from '../../services/foto-upload.service';

/**
 * Controle stap component
 * Overzicht van melding met verzend functionaliteit
 */
@Component({
  selector: 'app-controle-stap',
  standalone: true,
  imports: [
    ToastModule,
    NavigatieKnoppenComponent,
    MeldingOverzichtComponent,
    FotoSamenvattingComponent,
    ContactSamenvattingComponent,
    CardModule,
    TagModule
  ],
  templateUrl: './controle-stap.component.html',
})
export class ControleStapComponent {
  // Services
  private readonly navigatie = inject(NavigatieService);
  private readonly conceptService = inject(MeldingConceptService);
  private readonly verzendService = inject(MeldingVerzendingService);
  private readonly sessieStorage = inject(SessieStorageService);
  private readonly messageService = inject(MessageService);
  private readonly fotoUploadService = inject(FotoUploadService);

  // State
  // State
  private readonly isVerzenden = signal(false);

  readonly stapHeader = computed(() => {
    const huidigeIndex = this.navigatie.huidigeStapIndex() + 1;
    const totaalStappen = this.navigatie.totaalAantalStappen();
    const stapNaam = this.navigatie.krijgStapNaam(this.navigatie.huidigeStapIndex());
    return `Stap ${huidigeIndex}/${totaalStappen} - ${stapNaam}`;
  });

  // Computed data
  readonly contactGegevens = computed(() => this.conceptService.concept().contact);
  readonly classificatieResultaten = computed(() => {
    const meldingId = this.sessieStorage.krijgMeldingId();
    if (!meldingId) return null;
    return this.sessieStorage.krijgClassificatie(meldingId);
  });
  readonly kanVerzenden = computed(() => {
    // Basis validatie - foto en locatie zijn verplicht
    const concept = this.conceptService.concept();
    return concept.afbeeldingUrl && concept.locatie;
  });

  // Helper voor beste AI gok
  readonly getBestGuess = computed(() => {
    const resultaat = this.classificatieResultaten();
    if (!resultaat?.length) return 'Wordt nog geclassificeerd...';

    const beste = resultaat.reduce((prev, current) =>
      current.confidence > prev.confidence ? current : prev
    );

    return `${beste.type} (${(beste.confidence * 100).toFixed(0)}%)`;
  });

  async onVerzenden(): Promise<void> {
    if (!this.kanVerzenden() || this.isVerzenden()) return;

    this.isVerzenden.set(true);

    try {
      // Haal het melding ID op dat tijdens de foto-upload is opgeslagen
      const meldingId = this.fotoUploadService.getMeldingId();

      if (!meldingId) {
        throw new Error('Geen melding ID gevonden. Upload eerst een foto.');
      }

      // Verstuur de volledige melding naar de backend
      const concept = this.conceptService.concept();
      const meldingData = {
        lat: concept.locatie?.breedtegraad ?? 0,
        lon: concept.locatie?.lengtegraad ?? 0,
        email: concept.contact?.email ?? '',
        name: concept.contact?.naam ?? ''
      };

      await this.fotoUploadService.verstuurMelding(meldingId, meldingData).toPromise();

      this.messageService.add({
        severity: 'success',
        summary: 'Melding verstuurd!',
        detail: `Je melding is verstuurd met ID: ${meldingId}`,
        life: 6000
      });

      // Verwijder het melding ID uit de sessie na succesvolle verzending
      this.fotoUploadService.clearMeldingId();

      this.navigatie.volgende();
    } catch (error: any) {
      console.error('Error during verzending:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Verzending mislukt',
        detail: (error as Error).message,
        life: 8000
      });

      if (window.location.hostname === 'localhost') {
        await this.handleBackendUnreachableInDevMode();
      }
    } finally {
      this.isVerzenden.set(false);
    }
  }

  async handleBackendUnreachableInDevMode(): Promise<void> {
    if (window.location.hostname === 'localhost') {
      this.navigatie.volgende();
    }
  }

  onVorige(): void {
    this.navigatie.vorige();
  }

  onVolgende(): void {
    this.onVerzenden();
  }

  // Template helpers
  krijgConcept() {
    return this.conceptService.concept();
  }

  isBezig(): boolean {
    return this.isVerzenden();
  }
}