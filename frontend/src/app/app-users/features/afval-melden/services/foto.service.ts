import { Injectable } from '@angular/core';

/**
 * Compacte service voor foto handling.
 * Max 120 regels, 80 chars per regel.
 */
@Injectable({ providedIn: 'root' })
export class FotoService {
  private readonly MAX_WIDTH = 800;
  private readonly MAX_HEIGHT = 600;
  private readonly QUALITY = 0.8;

  /**
   * Maak foto van camera.
   */
  async maakFoto(): Promise<Blob> {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' } 
    });
    
    const video = document.createElement('video');
    video.srcObject = stream;
    video.play();
    
    return new Promise((resolve, reject) => {
      video.addEventListener('loadedmetadata', () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(video, 0, 0);
        
        // Stop camera stream
        stream.getTracks().forEach(track => track.stop());
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Kon foto niet maken'));
          }
        }, 'image/jpeg', this.QUALITY);
      });
    });
  }

  /**
   * Kies foto uit galerij.
   */
  async kiesFotoUitGalerij(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      
      input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) {
          reject(new Error('Geen bestand geselecteerd'));
          return;
        }
        
        const validationError = this.validateFoto(file);
        if (validationError) {
          reject(new Error(validationError));
          return;
        }
        
        try {
          const optimizedBlob = await this.optimaliseerFoto(file);
          resolve(optimizedBlob);
        } catch (error) {
          reject(error);
        }
      };
      
      input.click();
    });
  }

  /**
   * Resize en optimaliseer foto.
   */
  async optimaliseerFoto(file: File): Promise<Blob> {
    if (!file.type.startsWith('image/')) {
      throw new Error('Alleen afbeeldingen toegestaan');
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = this.createCanvas(img);
          canvas.toBlob(
            (blob) => blob ? resolve(blob) : reject(new Error('Resize fout')),
            'image/jpeg',
            this.QUALITY
          );
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => reject(new Error('Afbeelding laden mislukt'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Converteer blob naar data URL.
   */
  async blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Valideer foto bestand.
   */
  validateFoto(file: File): string | null {
    if (!file.type.startsWith('image/')) {
      return 'Alleen afbeeldingen toegestaan';
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB
      return 'Afbeelding te groot (max 10MB)';
    }

    return null;
  }

  private createCanvas(img: HTMLImageElement): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    // Bereken nieuwe afmetingen
    const { width, height } = this.calculateDimensions(
      img.width, 
      img.height
    );

    canvas.width = width;
    canvas.height = height;

    // Teken geresized afbeelding
    ctx.drawImage(img, 0, 0, width, height);
    
    return canvas;
  }

  private calculateDimensions(width: number, height: number) {
    let newWidth = width;
    let newHeight = height;

    if (width > this.MAX_WIDTH) {
      newWidth = this.MAX_WIDTH;
      newHeight = (height * this.MAX_WIDTH) / width;
    }

    if (newHeight > this.MAX_HEIGHT) {
      newHeight = this.MAX_HEIGHT;
      newWidth = (newWidth * this.MAX_HEIGHT) / newHeight;
    }

    return { width: Math.round(newWidth), height: Math.round(newHeight) };
  }

}