import { Component, inject, signal, computed } from '@angular/core';
import { NavigatieService } from '../../services/navigatie/navigatie.service';
import { MediaOrchestratorService } from '../../services/media-orchestrator.service';
import { SessieStorageService } from '../../services/opslag/sessie-storage.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CameraPreviewComponent } from './components/camera-preview/camera-preview.component';
import { FotoVoorvertoningComponent } from './components/foto-voorvertoning/foto-voorvertoning.component';
import { NavigatieKnoppenComponent } from '../shared/navigatie-knoppen/navigatie-knoppen.component';
import { FotoUploadService } from '../../services/foto-upload.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AfvalMeldingStateService } from '../../services/melding/state/afval-melding-state.service';

/**
 * Foto upload stap component
 * Gebruikt micro-components en async classificatie
 */
@Component({
  selector: 'app-foto-upload',
  templateUrl: './foto-upload.component.html',
  // Geen styleUrls meer nodig omdat we PrimeNG componenten gebruiken
  imports: [
    ToastModule,
    ToolbarModule,
    CardModule,
    ProgressSpinnerModule,
    CameraPreviewComponent,
    FotoVoorvertoningComponent,
    NavigatieKnoppenComponent,
    HttpClientModule
  ],
  standalone: true,
})
export class FotoUploadComponent {
  // Services
  private readonly messageService = inject(MessageService);
  private readonly navigatie = inject(NavigatieService);
  private readonly media = inject(MediaOrchestratorService);
  private readonly sessieStorage = inject(SessieStorageService);
  private readonly fotoUploadService = inject(FotoUploadService);
  private readonly afvalMeldingStateService = inject(AfvalMeldingStateService);
  
  // State signals
  private readonly fotoUrl = signal<string>('');
  private readonly fotoBlob = signal<Blob | null>(null);
  private readonly isUploaden = signal(false);
  private readonly uploadStatus = signal('Foto wordt verwerkt...');
  private readonly meldingId = signal<number | null>(null);

  // Computed signals
  readonly heeftFoto = computed(() => this.fotoUrl() !== '');
  readonly kanVolgende = computed(() => this.heeftFoto() && !this.isUploaden());
  readonly classificatieBezig = computed(() => this.media.aiBezig);

  constructor() {
    // Check of er al een melding ID is opgeslagen
    const opgeslagenId = this.fotoUploadService.getMeldingId();
    if (opgeslagenId) {
      this.meldingId.set(opgeslagenId);
    }
  }

  // Event handlers voor micro-components
  
  

  onCameraFout(error: any): void {
    console.error('Camera fout:', error);
    this.messageService.add({
      severity: 'error',
      summary: 'Camera fout',
      detail: error.message || 'Er is een fout opgetreden bij het starten van de camera',
      life: 5000
    });
  }

  async onFotoGeselecteerd(fotoBestand: File): Promise<void> {
    // Converteer blob naar URL voor preview
    const fotoUrl = URL.createObjectURL(fotoBestand);
    this.fotoUrl.set(fotoUrl);
    this.fotoBlob.set(fotoBestand);
    
    // Start async classificatie direct
    await this.startAsyncClassificatie(fotoBestand);
    
    this.messageService.add({
      severity: 'success',
      summary: 'Foto geselecteerd',
      detail: 'Classificatie wordt op de achtergrond uitgevoerd',
      life: 3000
    });
  }

  

  async onFotoBevestigd(): Promise<void> {
    if (!this.heeftFoto()) return;

    const blob = this.fotoBlob();
    if (!blob) return;

    this.isUploaden.set(true);
    this.uploadStatus.set('Foto wordt verwerkt...');

    try {
      // Upload foto naar backend
      const response = await this.fotoUploadService.uploadFoto(blob).toPromise();

      if (response) {
        // Sla het melding ID op
        this.meldingId.set(response.id);

        this.messageService.add({
          severity: 'success',
          summary: 'Foto verwerkt',
          detail: `Foto geüpload. Melding ID: ${response.id}`,
          life: 3000
        });

        // Ga naar volgende stap
        this.navigatie.volgende();
      }
    } catch (error) {
      console.error('Upload fout:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Upload mislukt',
        detail: 'Er ging iets mis bij het uploaden van de foto',
        life: 5000
      });
    } finally {
      this.isUploaden.set(false);
    }
  }

  onFotoVerwijderd(): void {
    // Cleanup URLs
    if (this.fotoUrl()) {
      URL.revokeObjectURL(this.fotoUrl());
    }

    this.fotoUrl.set('');
    this.fotoBlob.set(null);
    this.media.reset();
  }

  private async startAsyncClassificatie(fotoBlob: Blob): Promise<void> {
    try {
      this.uploadStatus.set('Afval wordt geclassificeerd...');
      await this.media.herkenAfval();
      console.log('Async classificatie voltooid');
    } catch (error) {
      console.error('Classificatie fout:', error);
      // Geen foutmelding tonen, classificatie is optioneel
    }
  }

  // Navigatie methoden
  onVorige(): void {
    this.navigatie.vorige();
  }

  onVolgende(): void {
    this.onFotoBevestigd();
  }

  onVolgendeZonderFoto(): void {
    this.afvalMeldingStateService.setFotoStapOvergeslagen(true);
    this.navigatie.volgende();
  }

  // Computed getters voor template
  krijgFotoUrl(): string {
    return this.fotoUrl();
  }

  krijgUploadStatus(): string {
    return this.uploadStatus();
  }

  isBezig(): boolean {
    return this.isUploaden();
  }

  krijgMeldingId(): number | null {
    return this.meldingId();
  }
}