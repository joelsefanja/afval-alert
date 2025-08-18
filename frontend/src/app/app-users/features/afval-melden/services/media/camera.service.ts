import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  private readonly activeStream = signal<MediaStream | null>(null);
  
  async requestUserMedia(): Promise<MediaStream> {
    if (!this.isMediaSupported()) {
      throw new Error('MediaDevices niet ondersteund');
    }
    
    // Stop any existing stream first
    this.stopCurrentStream();
    
    try {
      const stream = await this.tryEnvironmentCamera();
      this.activeStream.set(stream);
      return stream;
    } catch (error) {
      console.warn('Environment camera niet beschikbaar, proberen met user camera:', error);
      try {
        const stream = await this.tryUserCamera();
        this.activeStream.set(stream);
        return stream;
      } catch (fallbackError) {
        console.warn('User camera gefaald, proberen met elke camera:', fallbackError);
        const stream = await this.tryAnyCamera();
        this.activeStream.set(stream);
        return stream;
      }
    }
  }

  private isMediaSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  private async tryEnvironmentCamera(): Promise<MediaStream> {
    return navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      } 
    });
  }

  private async tryUserCamera(): Promise<MediaStream> {
    return navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'user',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      } 
    });
  }

  private async tryAnyCamera(): Promise<MediaStream> {
    return navigator.mediaDevices.getUserMedia({ 
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    });
  }

  attachStreamToVideo(video: HTMLVideoElement, stream: MediaStream): void {
    if (!video || !stream) return;
    
    // Essential attributes for proper camera display
    video.autoplay = true;
    video.playsInline = true; // Critical for iOS
    video.muted = true; // Required for autoplay
    video.controls = false;
    
    // Set the stream - modern browsers all support srcObject
    video.srcObject = stream;
  }

  async playVideo(video: HTMLVideoElement): Promise<void> {
    if (!video) return;
    
    // Wait for metadata to load before playing
    return new Promise((resolve, reject) => {
      const playVideo = async () => {
        try {
          await video.play();
          resolve();
        } catch (error) {
          console.warn('First play attempt failed, retrying:', error);
          try {
            await this.retryPlayVideo(video);
            resolve();
          } catch (retryError) {
            reject(retryError);
          }
        }
      };
      
      if (video.readyState >= 2) {
        // Metadata already loaded
        playVideo();
      } else {
        // Wait for metadata to load
        video.onloadedmetadata = playVideo;
        video.onerror = (e) => {
          console.error('Video element error:', e);
          reject(e);
        };
      }
    });
  }

  private async retryPlayVideo(video: HTMLVideoElement): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          await video.play();
          resolve();
        } catch (error) {
          reject(error);
        }
      }, 500);
    });
  }

  stopAllTracks(stream: MediaStream | null): void {
    if (!stream) return;
    
    stream.getTracks().forEach(track => {
      console.log(`Stopping ${track.kind} track:`, track.label);
      track.stop();
    });
  }

  stopCurrentStream(): void {
    const current = this.activeStream();
    if (current) {
      console.log('Stopping active camera stream');
      this.stopAllTracks(current);
      this.activeStream.set(null);
    }
  }

  capturePhotoFromVideo(video: HTMLVideoElement): string {
    if (!this.isVideoReady(video)) {
      throw new Error('Video niet gereed voor capture');
    }

    const canvas = this.createCanvas(video);
    const context = this.getCanvasContext(canvas);
    
    context.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.8);
  }

  private isVideoReady(video: HTMLVideoElement): boolean {
    return video && video.videoWidth > 0 && video.videoHeight > 0;
  }

  private createCanvas(video: HTMLVideoElement): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    return canvas;
  }

  private getCanvasContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas context niet beschikbaar');
    }
    return context;
  }
}