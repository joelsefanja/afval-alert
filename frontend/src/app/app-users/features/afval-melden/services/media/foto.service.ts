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
      video: { 
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      } 
    });
    
    const video = document.createElement('video');
    video.srcObject = stream;
    video.autoplay = true;
    video.playsInline = true;
    video.style.width = '100%';
    video.style.height = '300px';
    video.style.objectFit = 'cover';
    video.style.borderRadius = '8px';
    
    // Voeg video toe aan DOM voor preview
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.backgroundColor = 'rgba(0,0,0,0.8)';
    container.style.zIndex = '1000';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    container.style.padding = '20px';
    
    const captureButton = document.createElement('button');
    captureButton.textContent = 'Maak Foto';
    captureButton.style.marginTop = '20px';
    captureButton.style.padding = '12px 24px';
    captureButton.style.backgroundColor = '#22c55e';
    captureButton.style.color = 'white';
    captureButton.style.border = 'none';
    captureButton.style.borderRadius = '6px';
    captureButton.style.fontSize = '16px';
    captureButton.style.cursor = 'pointer';
    
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Annuleren';
    cancelButton.style.marginTop = '10px';
    cancelButton.style.padding = '8px 16px';
    cancelButton.style.backgroundColor = 'transparent';
    cancelButton.style.color = 'white';
    cancelButton.style.border = '1px solid white';
    cancelButton.style.borderRadius = '6px';
    cancelButton.style.fontSize = '14px';
    cancelButton.style.cursor = 'pointer';
    
    container.appendChild(video);
    container.appendChild(captureButton);
    container.appendChild(cancelButton);
    document.body.appendChild(container);
    
    await video.play();
    
    return new Promise((resolve, reject) => {
      const cleanup = () => {
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(container);
      };
      
      captureButton.onclick = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(video, 0, 0);
        
        cleanup();
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Kon foto niet maken'));
          }
        }, 'image/jpeg', this.QUALITY);
      };
      
      cancelButton.onclick = () => {
        cleanup();
        reject(new Error('Camera geannuleerd'));
      };
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