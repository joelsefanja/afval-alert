import { Component, ElementRef, ViewChild, inject, signal, computed, OnInit, AfterViewInit } from '@angular/core';
import { MediaService } from '@services/media/media.service';
import { ProcesNavigatorService } from '@services/proces/navigatie';
import { ProcesBuilderService } from '@services/proces/navigatie';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';

interface CameraState {
  inactive: 'inactive';
  starting: 'starting';
  active: 'active';
  capturing: 'capturing';
  error: 'error';
}

@Component({
  selector: 'app-foto-upload',
  templateUrl: './foto-upload.component.html',
  imports: [
    CommonModule,
    FormsModule,
    ToastModule,
    CardModule,
    ProgressSpinnerModule,
    TagModule,
    ButtonModule
  ],
  standalone: true,
})
export class FotoUploadComponent implements OnInit, AfterViewInit {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('photoElement') photoElement!: ElementRef<HTMLImageElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private messageService = inject(MessageService);
  private mediaService = inject(MediaService);
  private procesNavigator = inject(ProcesNavigatorService);
  private procesBuilder = inject(ProcesBuilderService);
  
  // Enhanced reactive signals
  cameraState = signal<keyof CameraState>('inactive');
  photoUrl = signal<string>('');
  isProcessing = signal(false);
  showVideo = signal(false);
  processingStep = signal<'camera' | 'capture' | 'upload' | 'analysis'>('camera');

  // Computed properties for better UX
  statusText = computed(() => {
    switch (this.cameraState()) {
      case 'active': return 'Live';
      case 'capturing': return 'Vastleggen...';
      default: return '';
    }
  });

  processingText = computed(() => {
    switch (this.processingStep()) {
      case 'camera': return 'Camera initialiseren...';
      case 'capture': return 'Foto vastleggen...';
      case 'upload': return 'Foto verwerken...';
      case 'analysis': return 'Afval analyseren...';
      default: return 'Verwerken...';
    }
  });

  private stream: MediaStream | null = null;
  private canvas = document.createElement('canvas');

  constructor() {
    document.addEventListener('keydown', this.handleKeydown.bind(this));
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
  }

  private handleKeydown(event: KeyboardEvent) {
    // Space bar to capture when camera is active
    if (event.code === 'Space' && this.cameraState() === 'active') {
      event.preventDefault();
      this.maakFoto();
    }
    // Enter to proceed to next step when photo is ready
    if (event.code === 'Enter' && this.photoUrl() && !this.isProcessing()) {
      event.preventDefault();
      this.volgendeStap();
    }
    // Escape to cancel camera or go back
    if (event.code === 'Escape') {
      if (this.cameraState() === 'active') {
        this.stopCamera();
      } else if (this.photoUrl()) {
        this.photoUrl.set('');
      }
    }
  }

  async startCamera() {
    if (this.isProcessing()) return;

    this.processingStep.set('camera');
    this.cameraState.set('starting');
    this.setProcessing(true);

    try {
      // Enhanced camera constraints
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
          aspectRatio: { ideal: 4/3 }
        }
      });

      this.videoElement.nativeElement.srcObject = this.stream;
      await this.videoElement.nativeElement.play();
    console.log('Camera started', this.videoElement.nativeElement.videoWidth, this.videoElement.nativeElement.videoHeight);
    this.showVideo.set(true);
    this.cameraState.set('active');
    this.photoUrl.set('');

      this.messageService.add({
        severity: 'success',
        summary: 'Camera actief',
        detail: 'Richt de camera op het afval en druk op de grote knop om vast te leggen',
        life: 4000
      });

    } catch (error) {
      console.error('Camera access failed:', error);
      this.cameraState.set('error');
      
      let errorMessage = 'Camera toegang niet mogelijk.';
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera toegang geweigerd. Sta toegang toe en probeer opnieuw.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'Geen camera gevonden. Gebruik de galerij optie.';
        }
      }
      
      this.messageService.add({
        severity: 'error',
        summary: 'Camera fout',
        detail: errorMessage,
        life: 6000
      });
      
      // Reset to inactive after error
      setTimeout(() => {
        if (this.cameraState() === 'error') {
          this.cameraState.set('inactive');
        }
      }, 3000);
      
    } finally {
      this.setProcessing(false);
    }
  }

  stopCamera() {
    this.cleanup();
    this.cameraState.set('inactive');
    this.showVideo.set(false);
  }

  async maakFoto() {
    if (this.isProcessing() || this.cameraState() !== 'active') return;

    this.processingStep.set('capture');
    this.cameraState.set('capturing');

    // Enhanced capture with animation timing
    setTimeout(() => {
      try {
        const video = this.videoElement.nativeElement;
        const context = this.canvas.getContext('2d');
        console.log('Taking photo', video.videoWidth, video.videoHeight);
        if (context && video.videoWidth && video.videoHeight) {
          this.canvas.width = video.videoWidth;
          this.canvas.height = video.videoHeight;
          
          // Enhanced image quality
          context.imageSmoothingEnabled = true;
          context.imageSmoothingQuality = 'high';
          context.drawImage(video, 0, 0);
          
          const dataURL = this.canvas.toDataURL('image/jpeg', 0.9);
          this.photoUrl.set(dataURL);

          this.stopCamera();
          this.cameraState.set('inactive');

          // Success feedback with haptic if available
          if ('vibrate' in navigator) {
            navigator.vibrate([50, 50, 50]);
          }

          this.messageService.add({
            severity: 'success',
            summary: 'Foto vastgelegd',
            detail: 'Je foto is gereed voor analyse. Controleer het resultaat en ga door.',
            life: 4000
          });
        } else {
          throw new Error('Video stream niet beschikbaar');
        }
      } catch (error) {
        console.error('Photo capture failed:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Vastleggen mislukt',
          detail: 'Probeer opnieuw of gebruik een foto uit de galerij.',
          life: 4000
        });
        this.cameraState.set('active');
      }
    }, 300);
  }

  selecteerVanGalerij() {
    this.fileInput.nativeElement.click();
  }

  verwerkBestandSelectie(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      // Enhanced validation
      if (!file.type.startsWith('image/')) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Ongeldig bestandstype',
          detail: 'Selecteer een afbeelding (JPG, PNG, WEBP)',
          life: 4000
        });
        return;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        this.messageService.add({
          severity: 'warn',
          summary: 'Bestand te groot',
          detail: 'De afbeelding mag maximaal 10MB zijn',
          life: 4000
        });
        return;
      }

      this.processingStep.set('upload');
      this.setProcessing(true);

      const reader = new FileReader();
      reader.onload = (e) => {
        this.photoUrl.set(e.target?.result as string);
        this.setProcessing(false);
        
        this.messageService.add({
          severity: 'success',
          summary: 'Foto geladen',
          detail: 'Je foto is gereed voor analyse',
          life: 3000
        });
      };
      
      reader.onerror = () => {
        this.setProcessing(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Laad fout',
          detail: 'Kon de foto niet laden. Probeer een andere foto.',
          life: 4000
        });
      };
      
      reader.readAsDataURL(file);
      input.value = ''; // Reset file input
    }
  }

  nieuweFoto() {
    this.photoUrl.set('');
    this.startCamera();
  }

  async volgendeStap() {
    if (this.isProcessing() || !this.photoUrl()) return;

    this.processingStep.set('analysis');
    this.setProcessing(true);

    try {
      // Simulate enhanced API call with progress
      await new Promise(resolve => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 20;
          if (progress >= 100) {
            clearInterval(interval);
            resolve(true);
          }
        }, 400);
      });
      
      // Haptic feedback for success
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
      
      this.messageService.add({
        severity: 'success',
        summary: 'Analyse voltooid',
        detail: 'Het afval is succesvol geanalyseerd! Resultaten worden geladen...',
        life: 5000
      });

      // Classify the photo if we have one
      if (this.photoUrl()) {
        await this.mediaService.classificeerFoto();
      }
      
      // Navigate to next step
      this.procesNavigator.volgende();

    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Analyse fout',
        detail: 'Er ging iets mis bij het analyseren. Controleer je internetverbinding en probeer opnieuw.',
        life: 6000
      });
    } finally {
      this.setProcessing(false);
    }
  }

  private setProcessing(processing: boolean) {
    this.isProcessing.set(processing);
  }

  private cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  // Navigation methods
  onVolgende() {
    this.volgendeStap();
  }

  onVorige() {
    this.procesNavigator.vorige();
  }
}
