import { Injectable, Output, EventEmitter } from '@angular/core';

/**
 * CameraService - Native browser camera API wrapper
 * Handles getUserMedia operations and photo capture
 */
@Injectable({
  providedIn: 'root',
})
export class CameraService {
  /**
   * Event emitted when file selection is cancelled
   */
  @Output() fileSelectionCancelled = new EventEmitter<void>();

  /**
   * Request user camera access with optimal settings
   */
  async getUserMedia(): Promise<MediaStream> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      console.error('Camera API not supported');
      throw new Error('Camera API niet ondersteund in deze browser');
    }

    try {
      console.log('Attempting to access camera with ideal settings...');
      // First try with ideal settings
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: 'environment' // Prefer back camera
        },
        audio: false
      });
      console.log('Camera access granted with ideal settings');
      return stream;
    } catch (error) {
      console.warn('Failed to access camera with ideal settings, trying fallback...', error);
      try {
        // Fallback to basic video constraint
        console.log('Attempting to access camera with fallback settings...');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
        console.log('Camera access granted with fallback settings');
        return stream;
      } catch (fallbackError) {
        console.error('Error accessing camera with fallback:', fallbackError);
        this.handleCameraError(fallbackError);
        throw fallbackError;
      }
    }
  }

  /**
   * Capture frame from video element as blob
   */
  async captureFrame(videoElement: HTMLVideoElement): Promise<Blob> {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error('Canvas context niet beschikbaar');
    }

    // Set canvas dimensions to video dimensions
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(videoElement, 0, 0);

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Foto capture mislukt'));
        }
      }, 'image/jpeg', 0.8);
    });
  }

  /**
   * Open file picker for photo selection
   */
  async selectFromDevice(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment'; // Prefer camera

      let cleanup = () => {
        // Clean up event listeners to prevent memory leaks
        input.onchange = null;
        input.onclick = null;
      };

      input.onchange = (event) => {
        cleanup();
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
          resolve(file);
        } else {
          // When no file is selected, it means the user cancelled the dialog
          this.fileSelectionCancelled.emit();
          reject(new Error('Geen foto geselecteerd'));
        }
      };

      input.click();
    });
  }

  /**
   * Stop all tracks in media stream
   */
  stopTracks(stream: MediaStream): void {
    stream.getTracks().forEach(track => {
      track.stop();
    });
  }

  /**
   * Handle camera permission and device errors
   */
  private handleCameraError(error: unknown): void {
    if (error instanceof Error) {
      if (error.name === 'NotAllowedError') {
        console.error('Camera toegang geweigerd door gebruiker');
      } else if (error.name === 'NotFoundError') {
        console.error('Geen camera gevonden');
      } else if (error.name === 'NotReadableError') {
        console.error('Camera in gebruik door andere applicatie');
      } else {
        console.error('Camera fout:', error.message);
      }
    } else {
      console.error('Onbekende camera fout:', error);
    }
  }
}