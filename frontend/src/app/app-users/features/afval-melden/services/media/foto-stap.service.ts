import { Injectable, inject, signal } from '@angular/core';
import { CameraService } from '../camera.service';
import { NavigatieService } from '../navigatie/navigatie.service';
import { FotoUploadService } from './foto-upload.service';

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
  private navigator = inject(NavigatieService);
  private fotoUpload = inject(FotoUploadService);

  readonly cameraActive = signal(false);
  readonly fotoUrl = signal<string | null>(null);
  private videoStream: MediaStream | null = null;

  async startCamera(): Promise<MediaStream | null> {
    try {
      this.videoStream = await this.cameraService.startCamera();
      if (this.videoStream) {
        this.cameraActive.set(true);
      }
      return this.videoStream;
    } catch (error) {
      console.error('Camera start failed:', error);
      return null;
    }
  }

  async takeFoto(video: HTMLVideoElement): Promise<void> {
    if (this.videoStream) {
      await this.cameraService.maakFoto(video);
      const photoUrl = this.cameraService.fotoURL;
      this.fotoUrl.set(photoUrl);
      this.stopCamera();
    }
  }

  async selectFromGallery(): Promise<void> {
    await this.cameraService.selecteerFoto();
    const photoUrl = this.cameraService.fotoURL;
    this.fotoUrl.set(photoUrl);
  }

  reset(): void {
    this.fotoUrl.set(null);
    this.stopCamera();
  }

  async next(): Promise<void> {
    console.log("hit");
    const url = this.fotoUrl();
    if (!url) return;
    const blob = await (await fetch(url)).blob();
    this.fotoUpload.upload(blob).subscribe({
      next: (res) => { console.log(res); this.navigator.volgende(); },
      error: (err) => console.error(err)
    });
  }

  stopCamera(): void {
    this.cameraService.stopCamera();
    this.videoStream = null;
    this.cameraActive.set(false);
  }
}