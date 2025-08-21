import { Injectable, inject, OnDestroy } from '@angular/core';
import { CameraService } from './camera.service';
import { AfvalHerkenningService } from './mock-classificatie.service';

@Injectable({ providedIn: 'root' })
export class MediaOrchestratorService implements OnDestroy {
  private camera = inject(CameraService);
  private herkenning = inject(AfvalHerkenningService);

  // ===== STATE =====
  get heeftFoto() { return this.camera.fotoIsBeschikbaar; }
  get fotoUrl() { return this.camera.fotoURL; }
  get fotoGrootte() { return this.camera.fotoGrootteKB; }
  get cameraActief() { return this.camera.cameraIsActief; }
  get cameraFout() { return this.camera.cameraFout; }
  get aiBezig() { return this.herkenning.herkenningIsBezig; }
  get aiResultaat() { return this.herkenning.laatsteResultaat; }
  get aiFout() { return this.herkenning.foutmelding; }

  get isBezig() { return this.aiBezig; }
  get kanFotoMaken() { return this.cameraActief && !this.isBezig; }
  get kanAIGebruiken() { return this.heeftFoto && !this.isBezig; }

  // ===== CAMERA =====
  startCamera(): Promise<MediaStream> { return this.camera.startCamera(); }
  stopCamera(): void { this.camera.stopCamera(); }

  async maakFoto(videoElement: HTMLVideoElement): Promise<void> {
    await this.camera.maakFoto(videoElement);
    await this.herkenningIndienFotoBeschikbaar();
  }

  async selecteerFoto(): Promise<void> {
    this.camera.stopCamera();
    await this.camera.selecteerFoto();
    await this.herkenningIndienFotoBeschikbaar();
  }

  verwijderFoto(): void {
    this.camera.verwijderFoto();
    this.herkenning.resetHerkenning();
  }

  // ===== AI =====
  private async herkenningIndienFotoBeschikbaar(): Promise<void> {
    const foto = this.camera.krijgFotoVoorUpload();
    if (!foto) return;
    await this.herkenning.startHerkenning(foto);
  }

  async herkenAfval(): Promise<void> {
    const foto = this.camera.krijgFotoVoorUpload();
    if (!foto) return;
    await this.herkenning.startHerkenning(foto);
  }

  async herkenOpnieuw(): Promise<void> {
    const foto = this.camera.krijgFotoVoorUpload();
    if (!foto) throw new Error('Geen foto beschikbaar');
    await this.herkenning.startHerkenningOpnieuw(foto);
  }

  // ===== UTILITY =====
  krijgAfvalTypes(): string[] { return this.herkenning.krijgAfvalTypenAlsTekst(); }
  krijgAfvalTypesGesorteerd(): Array<{ type: string; score: number }> {
    return this.herkenning.krijgAfvalTypenGesorteerdOpScore();
  }

  classificatieResultaat() { return this.herkenning.laatsteResultaat; }
  krijgFotoVoorUpload(): Blob | undefined { return this.camera.krijgFotoVoorUpload(); }
  maakFormData(veldNaam = 'foto'): FormData | undefined { return this.camera.maakFormData(veldNaam); }

  // ===== RESET & CLEANUP =====
  reset(): void {
    this.camera.reset();
    this.herkenning.resetHerkenning();
  }

  ngOnDestroy(): void { this.reset(); }
}
