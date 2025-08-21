import { Component, ElementRef, ViewChild, output, signal, inject, OnDestroy } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CameraService } from '../../../../services/camera.service';

/**
 * Live camera preview component met echte camera functionaliteit.
 * Toont live camera feed en kan foto's maken.
 */
@Component({
  selector: 'app-camera-preview',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './camera-preview.component.html',
  styles: [`
    .mirror {
      transform: scaleX(-1);
    }
    
    .capture-button {
      border-radius: 50% !important;
      background: white !important;
      color: black !important;
      border: 3px solid #ccc !important;
    }
    
    .capture-button:hover {
      background: #f0f0f0 !important;
      border-color: #999 !important;
    }
  `]
})
export class CameraPreviewComponent implements OnDestroy {
  @ViewChild('videoElement') videoElement?: ElementRef<HTMLVideoElement>;
  @ViewChild('galerijInput') galerijInput?: ElementRef<HTMLInputElement>;

  // Services
  private readonly cameraService = inject(CameraService);

  // Output signals
  readonly fotoGeselecteerd = output<File>();
  readonly cameraFout = output<any>();

  // State signals
  readonly isBezig = signal(false);
  readonly cameraGestart = signal(false);
  readonly cameraFoutmelding = signal('');
  readonly isFotoMaken = signal(false);

  private mediaStream?: MediaStream;

  // Getters for template access
  get mediaStreamActive() {
    return !!this.mediaStream;
  }
  
  isMobileDevice(): boolean {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Start de camera en toon live preview
   */
  async startCamera(): Promise<void> {
    this.isBezig.set(true);
    this.cameraFoutmelding.set('');
    console.log('🎥 Starting camera...');

    try {
      // Stop eventuele bestaande stream
      await this.stopCamera();

      // Detecteer device type en kies juiste camera
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      const constraints = {
        video: {
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          // Mobiel: achtercamera (environment), Desktop: standaard webcam
          facingMode: isMobile ? 'environment' : 'user',
          aspectRatio: { ideal: 16/9 }
        },
        audio: false
      };

      console.log('📹 Requesting media with constraints:', constraints);
      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('✅ MediaStream obtained:', this.mediaStream);
      
      // Wacht tot video element beschikbaar is
      await this.waitForVideoElement();
      
      if (this.videoElement && this.mediaStream) {
        const video = this.videoElement.nativeElement;
        console.log('🎬 Setting video srcObject...');
        
        video.srcObject = this.mediaStream;
        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;
        
        // Wacht op video metadata
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Video metadata timeout'));
          }, 5000);
          
          video.addEventListener('loadedmetadata', () => {
            clearTimeout(timeout);
            console.log('📺 Video metadata loaded, dimensions:', video.videoWidth, 'x', video.videoHeight);
            resolve(void 0);
          }, { once: true });
          
          video.addEventListener('error', (e) => {
            clearTimeout(timeout);
            reject(e);
          }, { once: true });
        });
        
        // Start video playback
        await video.play();
        console.log('▶️ Video is playing');
        
        this.cameraGestart.set(true);
      }

    } catch (error: any) {
      console.error('❌ Camera start fout:', error);
      this.cameraFoutmelding.set(error.message || 'Camera kon niet worden gestart');
      this.cameraFout.emit(error);
    } finally {
      this.isBezig.set(false);
    }
  }

  /**
   * Stop de camera stream
   */
  async stopCamera(): Promise<void> {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = undefined;
    }
    
    this.cameraService.stopCamera();
    this.cameraGestart.set(false);
    
    if (this.videoElement) {
      this.videoElement.nativeElement.srcObject = null;
    }
  }

  /**
   * Wacht tot video element beschikbaar is
   */
  private async waitForVideoElement(): Promise<void> {
    return new Promise((resolve) => {
      const checkElement = () => {
        if (this.videoElement) {
          resolve();
        } else {
          setTimeout(checkElement, 50);
        }
      };
      checkElement();
    });
  }

  /**
   * Toon camera informatie
   */
  showCameraInfo(): void {
    const isMobile = this.isMobileDevice();
    const cameraType = isMobile ? 'achtercamera' : 'webcam';
    const message = `Gebruikt ${cameraType} voor optimale foto kwaliteit`;
    
    console.log('📷 Camera info:', message);
    // Hier zou je een toast message kunnen tonen
  }

  /**
   * Maak een foto van de huidige camera stream
   */
  async maakFoto(): Promise<void> {
    if (!this.videoElement || !this.mediaStream) {
      this.cameraFout.emit(new Error('Camera niet actief'));
      return;
    }

    this.isFotoMaken.set(true);

    try {
      const video = this.videoElement.nativeElement;
      
      // Wacht tot video ready is
      if (video.readyState < 2) {
        await new Promise(resolve => {
          video.addEventListener('loadeddata', resolve, { once: true });
        });
      }

      // Maak foto via camera service
      await this.cameraService.maakFoto(video);
      
      // Converteer naar File object
      const fotoBlob = this.cameraService.krijgFotoVoorUpload();
      if (fotoBlob) {
        const fotoFile = new File([fotoBlob], 'camera-foto.jpg', {
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        
        // Stop camera na foto maken
        await this.stopCamera();
        
        // Emit foto
        this.fotoGeselecteerd.emit(fotoFile);
      }

    } catch (error: any) {
      console.error('Foto maken fout:', error);
      this.cameraFout.emit(error);
    } finally {
      this.isFotoMaken.set(false);
    }
  }

  /**
   * Skip foto functie voor development
   */
  skipFoto(): void {
    // Creëer een dummy foto voor development
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Teken een simpel patroon
      ctx.fillStyle = '#4A90E2';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = 'white';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('DEVELOPMENT FOTO', canvas.width / 2, canvas.height / 2);
      ctx.fillText(new Date().toLocaleTimeString(), canvas.width / 2, canvas.height / 2 + 30);
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'development-foto.jpg', {
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        this.fotoGeselecteerd.emit(file);
      }
    }, 'image/jpeg', 0.8);
  }

  /**
   * Open galerij voor foto selectie
   */
  onKiesUitGalerij(): void {
    this.galerijInput?.nativeElement.click();
  }

  /**
   * Behandel geselecteerd bestand van galerij
   */
  onBestandGeselecteerd(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const bestand = input.files[0];
      
      this.isBezig.set(true);
      
      // Simuleer verwerking
      setTimeout(() => {
        this.fotoGeselecteerd.emit(bestand);
        this.isBezig.set(false);
        // Reset input
        input.value = '';
      }, 500);
    }
  }

  /**
   * Debug: Video loaded event handler
   */
  onVideoLoaded(event: Event): void {
    const video = event.target as HTMLVideoElement;
    console.log('📺 Video loaded:', video.videoWidth, 'x', video.videoHeight);
    
    // Update debug info
    const debugEl = document.getElementById('videoDebug');
    if (debugEl) {
      debugEl.textContent = `Video: ${video.videoWidth}x${video.videoHeight}`;
    }
  }

  /**
   * Debug: Video error event handler
   */
  onVideoError(event: Event): void {
    console.error('📺 Video error:', event);
    const debugEl = document.getElementById('videoDebug');
    if (debugEl) {
      debugEl.textContent = 'Video: ERROR';
    }
  }

  /**
   * Cleanup bij component vernietiging
   */
  ngOnDestroy(): void {
    this.stopCamera();
    this.cameraService.reset();
  }
}