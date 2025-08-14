import { Component, inject, signal, input, output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { ImageModule } from 'primeng/image';
import { DividerModule } from 'primeng/divider';
import { SpeedDialModule } from 'primeng/speeddial';
import { ChipModule } from 'primeng/chip';
import { MeldingsProcedureStatus } from '../../services/melding/melding-state.service';
import { FotoService } from '../../services/media/foto.service';
import { FotoMockService } from '../../services/media/foto-mock.service';

// Type interface voor service injection
interface IFotoService {
  maakFoto(): Promise<Blob>;
  kiesFotoUitGalerij(): Promise<Blob>;
  blobToDataUrl(blob: Blob): Promise<string>;
}

/**
 * Component voor het maken of selecteren van een foto van zwerfafval.
 * 
 * Deze component biedt de gebruiker twee opties:
 * 1. Een foto maken met de camera (beperkte container, niet volledig scherm)
 * 2. Een foto selecteren uit de galerij
 * 
 * Features:
 * - Live camera preview in beperkte container
 * - Typische ronde foto knop zoals echte camera apps
 * - Responsive design voor mobile en desktop
 * - Annuleer functionaliteit om terug te gaan naar foto opties
 * - Error handling voor camera toegang
 * 
 * @example
 * ```html
 * <app-foto-stap 
 *   [disabled]="false"
 *   (fotoGemaakt)="onFotoGemaakt($event)"
 *   (navigatieTerug)="onTerug()"
 *   (navigatieVolgende)="onVolgende()">
 * </app-foto-stap>
 * ```
 */
@Component({
  selector: 'app-foto-stap',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, MessageModule, FileUploadModule, ToastModule, ImageModule, DividerModule, SpeedDialModule, ChipModule],
  templateUrl: './foto-stap.component.html',
  styleUrls: ['./foto-stap.component.scss']
})
export class FotoStapComponent implements OnDestroy {
  // Dependency injection
  protected readonly state = inject(MeldingsProcedureStatus);
  private readonly fotoService = inject(FotoService) as IFotoService;
  
  // Input properties
  /** Schakelt de component uit wanneer true */
  readonly disabled = input<boolean>(false);
  
  // Output events
  /** Event dat wordt uitgezonden wanneer een foto is gemaakt */
  readonly fotoGemaakt = output<string>();
  /** Event voor navigatie terug */
  readonly navigatieTerug = output<void>();
  /** Event voor navigatie naar volgende stap */
  readonly navigatieVolgende = output<void>();
  
  // Component state signals
  /** Geeft aan of de camera actief is */
  protected readonly cameraActive = signal<boolean>(false);
  /** Referentie naar het video element */
  protected readonly videoElement = signal<HTMLVideoElement | null>(null);
  /** MediaStream van de camera */
  protected readonly stream = signal<MediaStream | null>(null);
  
  // SpeedDial model voor camera knop
  protected readonly speedDialItems = [
    {
      icon: 'pi pi-camera',
      command: () => this.maakFoto()
    }
  ];

  /**
   * Lifecycle hook - cleanup bij component vernietiging
   */
  ngOnDestroy(): void {
    this.stopCamera();
  }

  /**
   * Navigeert terug naar de vorige stap en stopt de camera
   */
  protected terug(): void { 
    this.stopCamera();
    this.navigatieTerug.emit();
this.state.gaTerugNaarVorige?.();
  }
  
  /**
   * Navigeert naar de volgende stap en stopt de camera
   */
  protected volgende(): void { 
    this.stopCamera();
    this.navigatieVolgende.emit();
    this.state.gaNaarVolgende(); 
  }

  /**
   * Annuleert de gemaakte foto en gaat terug naar foto opties
   * Dit is de gewenste functionaliteit: terug naar scherm met foto knoppen
   */
  protected annuleerFoto(): void {
    this.stopCamera();
    this.state.setFotoUrl('');
    this.state.setFotoError('');
  }

  /**
   * Start de camera met optimale instellingen voor afval fotografie
   * - Gebruikt achtercamera op mobiele apparaten (environment)
   * - Beperkte container grootte (niet volledig scherm)
   * - HD kwaliteit voor goede AI herkenning
   */
  protected async startCamera(): Promise<void> {
    if (this.disabled()) return;
    
    try {
      this.cameraActive.set(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Achtercamera voor mobiel
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      this.stream.set(stream);
    } catch (error) {
      console.error('Camera toegang geweigerd:', error);
      this.state.setFotoError('Camera niet beschikbaar. Controleer je browser instellingen.');
      this.cameraActive.set(false);
    }
  }

  /**
   * Stopt de camera en ruimt MediaStream op
   */
  protected stopCamera(): void {
    const currentStream = this.stream();
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
      this.stream.set(null);
    }
    this.cameraActive.set(false);
  }

  /**
   * Maakt een foto van de huidige camera feed
   * - Gebruikt canvas voor foto capture
   * - JPEG compressie voor kleinere bestanden
   * - Automatische cleanup van camera na foto
   */
  protected async maakFoto(): Promise<void> {
    const video = this.videoElement();
    if (!video || this.disabled()) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context niet beschikbaar');
      
      ctx.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          this.state.setFotoUrl(url);
          this.fotoGemaakt.emit(url);
          this.stopCamera();
        }
      }, 'image/jpeg', 0.8); // 80% kwaliteit voor goede balans tussen kwaliteit en bestandsgrootte
    } catch (error) {
      console.error('Foto maken mislukt:', error);
      this.state.setFotoError('Foto maken mislukt. Probeer het opnieuw.');
    }
  }
  
  /**
   * Opent de galerij voor foto selectie
   */
  protected async kiesFotoUitGalerij(): Promise<void> {
    if (this.disabled()) return;
    
    try {
      const blob = await this.fotoService.kiesFotoUitGalerij();
      const url = await this.fotoService.blobToDataUrl(blob);
      this.state.setFotoUrl(url);
      this.fotoGemaakt.emit(url);
    } catch (error) {
      console.error('Foto selectie mislukt:', error);
      this.state.setFotoError('Foto kiezen mislukt. Probeer het opnieuw.');
    }
  }

  /**
   * Callback voor wanneer video element geladen is
   * Koppelt de MediaStream aan het video element
   */
  protected onVideoLoaded(video: HTMLVideoElement): void {
    this.videoElement.set(video);
    const currentStream = this.stream();
    if (currentStream) {
      video.srcObject = currentStream;
    }
  }

  /**
   * Handler voor file selectie via PrimeNG FileUpload
   */
  protected onFileSelect(event: any): void {
    if (this.disabled()) return;
    
    const file = event.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.state.setFotoUrl(e.target.result);
        this.fotoGemaakt.emit(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      this.state.setFotoError('Selecteer een geldig afbeeldingsbestand');
    }
  }

  /**
   * Handler voor file upload via PrimeNG FileUpload
   */
  protected onFileUpload(event: any): void {
    // In this case, we're using auto upload so this might not be needed
    // But we'll keep it for completeness
  }
}