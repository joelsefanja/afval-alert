import { Injectable, signal, computed, inject, Output, EventEmitter } from '@angular/core';
import { CameraService } from './camera.service';
import { IAfvalClassificatieService, AfvalClassificatieResponse } from '../../interfaces/afval-classificatie.interface';
import { AFVAL_CLASSIFICATIE_SERVICE } from './afval-classificatie.token';

/**
 * MediaService - Complete media handling orchestrator
 * Manages camera, photos, and AI classification
 */
@Injectable({
  providedIn: 'root',
})
export class MediaService {
  private readonly camera = inject(CameraService);
  private readonly ai = inject(AFVAL_CLASSIFICATIE_SERVICE);

  /**
   * Event emitted when file selection is cancelled
   */
  @Output() fileSelectionCancelled = new EventEmitter<void>();

  // State signals
  readonly fotoBlob = signal<Blob | null>(null);
  readonly cameraActive = signal<boolean>(false);
  readonly classificatieResultaat = signal<AfvalClassificatieResponse | null>(null);
  readonly isProcessing = signal<boolean>(false);
  readonly stream$ = signal<MediaStream | null>(null);
  
  // Computed signals
  readonly heeftFoto = computed(() => this.fotoBlob() !== null);
  readonly fotoUrl = computed(() => {
    const blob = this.fotoBlob();
    return blob ? URL.createObjectURL(blob) : null;
  });
  readonly kanClassificeren = computed(() => 
    this.heeftFoto() && !this.isProcessing()
  );
  
  private stream: MediaStream | null = null;

  constructor() {
    // Luister naar het annuleren event van de camera service
    this.camera.fileSelectionCancelled.subscribe(() => {
      this.fileSelectionCancelled.emit();
    });
  }

  // === CAMERA OPERATIES ===
  async startCamera(videoElement: HTMLVideoElement): Promise<void> {
    console.log('MediaService: Starting camera...');
    if (this.stream) {
      console.log('MediaService: Stopping existing stream');
      this.stopCamera();
    }

    try {
      console.log('MediaService: Requesting camera access...');
      this.stream = await this.camera.getUserMedia();
      console.log('MediaService: Camera access granted, stream:', this.stream);
      this.stream$.set(this.stream);
      this.cameraActive.set(true);
      if (videoElement) {
        console.log('MediaService: Setting video element srcObject');
        videoElement.srcObject = this.stream;
        console.log('MediaService: Calling play() on video element');
        await videoElement.play(); // Wait for play to complete
        console.log('MediaService: Video play successful');
      }
    } catch (error) {
      console.error('Camera start mislukt:', error);
      this.cameraActive.set(false);
      this.stream = null;
      this.stream$.set(null);
      throw error;
    }
  }

  stopCamera(): void {
    if (this.stream) {
      this.camera.stopTracks(this.stream);
      this.cameraActive.set(false);
      this.stream = null;
      this.stream$.set(null);
    }
  }

  async maakFoto(videoElement: HTMLVideoElement): Promise<void> {
    if (!videoElement) throw new Error('Video element vereist');
    
    this.isProcessing.set(true);
    try {
      const blob = await this.camera.captureFrame(videoElement);
      this.fotoBlob.set(blob);
      this.stopCamera();
    } finally {
      this.isProcessing.set(false);
    }
  }

  async selecteerFoto(): Promise<void> {
    this.isProcessing.set(true);
    try {
      const blob = await this.camera.selectFromDevice();
      this.fotoBlob.set(blob);
    } catch (error: unknown) {
      // Als het een annuleringsfout is, emit dan het annuleren event
      if (error instanceof Error && (error.message === 'Geen foto geselecteerd' || error.message === 'Foto selectie geannuleerd')) {
        this.fileSelectionCancelled.emit();
      }
      throw error;
    } finally {
      this.isProcessing.set(false);
    }
  }

  // === AI CLASSIFICATIE ===
  async classificeerFoto(): Promise<AfvalClassificatieResponse | null> {
    if (!this.heeftFoto()) return null;
    
    this.isProcessing.set(true);
    try {
      const foto = this.fotoBlob()!;
      const resultaat = await this.ai.classificeerAfval(foto);
      this.classificatieResultaat.set(resultaat);
      return resultaat;
    } catch (error) {
      console.error('Classificatie mislukt:', error);
      return null;
    } finally {
      this.isProcessing.set(false);
    }
  }

  // === UTILITY ===
  reset(): void {
    this.stopCamera();
    this.fotoBlob.set(null);
    this.classificatieResultaat.set(null);
    this.isProcessing.set(false);
  }

  // Legacy methods voor backward compatibility
  get hasFoto() { return this.heeftFoto; }
  get detectieResultaat() { return this.classificatieResultaat; }
  takeFoto = this.maakFoto;
  selectFromGallery = this.selecteerFoto;
  classifyFoto = this.classificeerFoto;
}