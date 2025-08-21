import { Injectable, computed, inject } from '@angular/core';
import { MediaOrchestratorService } from '../../media-orchestrator.service';

/**
 * Foto stap service
 * Beheert foto stap logica en validatie
 */
@Injectable({ providedIn: 'root' })
export class FotoStapService {
  private readonly media = inject(MediaOrchestratorService);
  
  // Delegated signals from media service
  readonly heeftFoto = this.media.heeftFoto;
  readonly fotoUrl = this.media.fotoUrl;
  readonly cameraActief = this.media.cameraActief;
  readonly isBezig = this.media.isBezig;
  readonly aiResultaat = this.media.aiResultaat;
  
  // Stap-specifieke computed properties
  readonly kanDoorgaan = computed(() => this.heeftFoto);
  readonly kanFotoMaken = computed(() => this.media.kanFotoMaken);
  readonly toonCamera = computed(() => this.cameraActief && !this.heeftFoto);
  readonly toonFoto = computed(() => this.heeftFoto);
  readonly toonAIResultaat = computed(() => !!this.aiResultaat);
  
  // === CAMERA OPERATIES ===
  async startCamera(): Promise<MediaStream> {
    return this.media.startCamera();
  }
  
  stopCamera(): void {
    this.media.stopCamera();
  }
  
  // === FOTO OPERATIES ===
  async maakFoto(videoElement: HTMLVideoElement): Promise<void> {
    await this.media.maakFoto(videoElement);
  }
  
  async selecteerVanGalerij(): Promise<void> {
    try {
      await this.media.selecteerFoto();
    } catch (error) {
      // Handle cancellation gracefully
      if (error instanceof Error && 
          (error.message.includes('geannuleerd') || error.message.includes('geselecteerd'))) {
        // User cancelled, not really an error
        return;
      }
      throw error;
    }
  }
  
  verwijderFoto(): void {
    this.media.verwijderFoto();
  }
  
  // === AI OPERATIES ===
  async herkenAfvalOpnieuw(): Promise<void> {
    await this.media.herkenOpnieuw();
  }
  
  krijgAfvalTypes(): string[] {
    return this.media.krijgAfvalTypes();
  }
  
  // === UTILITY ===
  krijgFotoVoorVerwerking(): Blob | null | undefined {
    return this.media.krijgFotoVoorUpload();
  }
  
  resetStap(): void {
    this.media.reset();
  }
}