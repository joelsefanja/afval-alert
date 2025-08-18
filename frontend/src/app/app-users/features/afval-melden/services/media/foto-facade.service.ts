import { Injectable, inject, signal, computed } from '@angular/core';
import { FotoService } from './foto.service';
import { CameraService } from './camera.service';
import { MeldingsProcedureStatus } from '../melding/melding-state.service';

export interface FotoState {
  readonly cameraActive: boolean;
  readonly isLoading: boolean;
  readonly hasPhoto: boolean;
  readonly photoUrl: string;
  readonly errorMessage: string;
}

@Injectable({
  providedIn: 'root'
})
export class FotoFacadeService {
  private readonly fotoService = inject(FotoService);
  private readonly cameraService = inject(CameraService);
  private readonly state = inject(MeldingsProcedureStatus);

  private readonly _cameraActive = signal(false);
  private readonly _isLoading = signal(false);

  readonly fotoState = computed<FotoState>(() => ({
    cameraActive: this._cameraActive(),
    isLoading: this._isLoading(),
    hasPhoto: !!this.state.fotoUrl(),
    photoUrl: this.state.fotoUrl(),
    errorMessage: this.state.fotoError()
  }));

  async startCamera(): Promise<MediaStream> {
    this.clearError();
    this._isLoading.set(true);
    
    try {
      const stream = await this.cameraService.requestUserMedia();
      this._cameraActive.set(true);
      return stream;
    } catch (error) {
      this.handleError('Camera niet beschikbaar. Controleer je browser instellingen.');
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  stopCamera(): void {
    this._cameraActive.set(false);
    this.cameraService.stopCurrentStream();
  }

  async capturePhoto(video: HTMLVideoElement): Promise<string> {
    this.validateVideoElement(video);
    this.clearError();
    
    try {
      const dataUrl = this.cameraService.capturePhotoFromVideo(video);
      this.savePhoto(dataUrl);
      this.stopCamera();
      return dataUrl;
    } catch (error) {
      this.handleError('Foto maken mislukt. Probeer het opnieuw.');
      throw error;
    }
  }

  async selectFromGallery(): Promise<string> {
    this.clearError();
    this._isLoading.set(true);
    
    try {
      const blob = await this.fotoService.kiesFotoUitGalerij();
      const url = await this.fotoService.blobToDataUrl(blob);
      this.savePhoto(url);
      return url;
    } catch (error) {
      this.handleError('Foto kiezen mislukt. Probeer het opnieuw.');
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  cancelPhoto(): void {
    this.state.setFotoUrl('');
    this.clearError();
    this.stopCamera();
  }

  private validateVideoElement(video: HTMLVideoElement): void {
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      throw new Error('Video element niet gereed voor capture');
    }
  }

  private savePhoto(url: string): void {
    this.state.setFotoUrl(url);
  }

  private handleError(message: string): void {
    this.state.setFotoError(message);
  }

  private clearError(): void {
    this.state.setFotoError('');
  }
}