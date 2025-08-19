import { Injectable, inject, signal } from '@angular/core';
import { CameraService } from './camera.service';
import { MeldingStateService } from '../melding';
import { StepBuilderService } from '../steps/step-builder.service';

/**
 * FotoStapService - Service voor foto stap logica
 * 
 * Verantwoordelijkheden:
 * - Camera beheer (start/stop)
 * - Foto maken en opslaan
 * - Galerij selectie
 * - State synchronisatie
 * 
 * @example
 * ```typescript
 * constructor(private fotoService: FotoStapService) {}
 * 
 * async maakFoto() {
 *   await this.fotoService.takeFoto();
 *   if (this.fotoService.fotoUrl()) {
 *     this.fotoService.next();
 *   }
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class FotoStapService {
  private cameraService = inject(CameraService);
  private meldingState = inject(MeldingStateService);
  private stepBuilder = inject(StepBuilderService);
  
  readonly cameraActive = signal(false);
  readonly fotoUrl = signal<string | null>(null);
  private videoStream: MediaStream | null = null;

  async startCamera(): Promise<MediaStream | null> {
    this.videoStream = await this.cameraService.getUserMedia();
    if (this.videoStream) {
      this.cameraActive.set(true);
    }
    return this.videoStream;
  }

  takeFoto(video: HTMLVideoElement): void {
    if (this.videoStream) {
      const photoUrl = this.cameraService.captureFrame(video);
      this.fotoUrl.set(photoUrl);
      this.meldingState.setFoto(photoUrl);
      this.stopCamera();
    }
  }

  async selectFromGallery(): Promise<void> {
    const photoUrl = await this.cameraService.selectFromDevice();
    this.fotoUrl.set(photoUrl);
    this.meldingState.setFoto(photoUrl);
  }

  reset(): void {
    this.fotoUrl.set(null);
    this.stopCamera();
  }

  next(): void {
    this.stepBuilder.next();
  }

  stopCamera(): void {
    if (this.videoStream) {
      this.cameraService.stopTracks(this.videoStream);
    }
    this.videoStream = null;
    this.cameraActive.set(false);
  }
}