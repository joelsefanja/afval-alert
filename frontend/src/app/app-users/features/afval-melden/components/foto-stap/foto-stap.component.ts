import { Component, inject, input, output, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ImageModule } from 'primeng/image';
import { DividerModule } from 'primeng/divider';
import { SpeedDialModule } from 'primeng/speeddial';
import { ChipModule } from 'primeng/chip';
import { MeldingsProcedureStatus } from '../../services/melding/melding-state.service';
import { FotoFacadeService, FotoState } from '../../services/media/foto-facade.service';
import { CameraService } from '../../services/media/camera.service';

/**
 * Presentational component voor foto maken/selecteren.
 * Alle business logica is verplaatst naar FotoFacadeService.
 */
@Component({
  selector: 'app-foto-stap',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, MessageModule, ToastModule, ImageModule, DividerModule, SpeedDialModule, ChipModule],
  templateUrl: './foto-stap.component.html',
  styleUrls: ['./foto-stap.component.scss']
})
export class FotoStapComponent implements OnDestroy {
  // Dependency injection
  protected readonly state = inject(MeldingsProcedureStatus);
  private readonly fotoFacade = inject(FotoFacadeService);
  private readonly cameraService = inject(CameraService);
  
  // Input properties
  readonly disabled = input<boolean>(false);
  
  // Output events
  readonly fotoGemaakt = output<string>();
  readonly navigatieTerug = output<void>();
  readonly navigatieVolgende = output<void>();
  
  // Facade state
  protected readonly fotoState = this.fotoFacade.fotoState;
  
  // Video element reference
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
  protected videoStream: MediaStream | null = null;

  ngOnDestroy(): void {
    this.fotoFacade.stopCamera();
    this.cleanupVideoElement();
  }

  protected terug(): void {
    this.fotoFacade.stopCamera();
    this.navigatieTerug.emit();
    this.state.gaTerugNaarVorige?.();
  }
  
  protected volgende(): void {
    this.fotoFacade.stopCamera();
    this.navigatieVolgende.emit();
    this.state.gaNaarVolgende();
  }

  protected annuleerFoto(): void {
    this.fotoFacade.cancelPhoto();
  }

  protected async startCamera(): Promise<void> {
    if (this.disabled()) return;
    
    try {
      console.log('Starting camera from component');
      this.videoStream = await this.fotoFacade.startCamera();

      // Zorg dat het DOM-element al bestaat
      await new Promise(resolve => setTimeout(resolve));

      const video = this.videoRef?.nativeElement;
      if (video && this.videoStream) {
        await this.cameraService.attachStreamToVideo(video, this.videoStream);
        console.log('Camera stream attached to video element');
      }
    } catch (error) {
      console.error('Camera start failed:', error);
    }
  }

  protected stopCamera(): void {
    this.fotoFacade.stopCamera();
    this.cleanupVideoElement();
  }

  protected async maakFoto(): Promise<void> {
    if (this.disabled() || !this.videoRef) return;

    try {
      const video = this.videoRef.nativeElement;
      const photoUrl = await this.fotoFacade.capturePhoto(video);
      this.fotoGemaakt.emit(photoUrl);
    } catch (error) {
      // Error handling is done by the facade
    }
  }

  protected async kiesFotoUitGalerij(): Promise<void> {
    if (this.disabled()) return;
    
    try {
      const photoUrl = await this.fotoFacade.selectFromGallery();
      this.fotoGemaakt.emit(photoUrl);
    } catch (error) {
      // Error handling is done by the facade
    }
  }

  private cleanupVideoElement(): void {
    if (!this.videoRef) return;
    
    const video = this.videoRef.nativeElement;
    if (video.srcObject) {
      this.cameraService.stopAllTracks(video.srcObject as MediaStream);
      video.srcObject = null;
    }
    video.pause();
    this.videoStream = null;
  }
}