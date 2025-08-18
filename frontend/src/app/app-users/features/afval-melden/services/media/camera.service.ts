import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  private readonly activeStream = signal<MediaStream | null>(null);
  private availableDevices: MediaDeviceInfo[] = [];
  
  async requestUserMedia(): Promise<MediaStream> {
    if (!this.isMediaSupported()) {
      throw new Error('MediaDevices API niet ondersteund');
    }
    
    // Stop any existing stream first
    this.stopCurrentStream();
    
    try {
      // First enumerate available devices to make informed choices
      await this.enumerateDevices();
      
      // Try to get optimal camera with progressive fallback
      const stream = await this.getOptimalCameraStream();
      
      // Verify stream is active
      const videoTracks = stream.getVideoTracks();
      if (videoTracks.length === 0) {
        throw new Error('No video tracks in stream');
      }
      
      const videoTrack = videoTracks[0];
      console.log(`Using video device: ${videoTrack.label}`);
      console.log('Video track settings:', videoTrack.getSettings());
      
      // Set up stream monitoring
      stream.onremovetrack = () => {
        console.log('Stream track ended');
        this.activeStream.set(null);
      };
      
      this.activeStream.set(stream);
      return stream;
    } catch (error) {
      this.handleGetUserMediaError(error);
      throw error;
    }
  }

  private async enumerateDevices(): Promise<void> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.availableDevices = devices.filter(device => device.kind === 'videoinput');
      
      console.log('Available video devices:', this.availableDevices.map(d => 
        `${d.label || 'Unknown'} (${d.deviceId.substring(0, 8)}...)`
      ));
    } catch (error) {
      console.warn('Could not enumerate devices:', error);
      this.availableDevices = [];
    }
  }

  private async getOptimalCameraStream(): Promise<MediaStream> {
    // Progressive fallback strategy for best compatibility
    const strategies = [
      // Strategy 1: High-quality user camera (front-facing for selfies)
      {
        video: {
          facingMode: 'user',
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          frameRate: { ideal: 30, min: 15 }
        },
        audio: false
      },
      
      // Strategy 2: Any user camera with lower requirements
      {
        video: {
          facingMode: 'user',
          width: { ideal: 640, min: 320 },
          height: { ideal: 480, min: 240 }
        },
        audio: false
      },
      
      // Strategy 3: Environment camera (back-facing)
      {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        },
        audio: false
      },
      
      // Strategy 4: Any available camera (minimal constraints)
      {
        video: true,
        audio: false
      }
    ];

    let lastError: Error | null = null;

    for (const [index, constraints] of strategies.entries()) {
      try {
        console.log(`Trying camera strategy ${index + 1}:`, constraints);
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        const videoTracks = stream.getVideoTracks();
        if (videoTracks.length > 0) {
          console.log(`Strategy ${index + 1} successful`);
          return stream;
        }
      } catch (error) {
        console.warn(`Strategy ${index + 1} failed:`, error);
        lastError = error as Error;
        continue;
      }
    }

    throw lastError || new Error('Alle camera strategieën gefaald');
  }

  private handleGetUserMediaError(error: any): void {
    if (error.name === 'OverconstrainedError') {
      console.error('Camera constraints niet ondersteund door apparaat:', error);
    } else if (error.name === 'NotAllowedError') {
      console.error('Camera toegang geweigerd door gebruiker:', error);
    } else if (error.name === 'NotFoundError') {
      console.error('Geen camera gevonden:', error);
    } else if (error.name === 'NotReadableError') {
      console.error('Camera in gebruik door andere applicatie:', error);
    } else {
      console.error(`getUserMedia error: ${error.name}`, error);
    }
  }

  private isMediaSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  async attachStreamToVideo(video: HTMLVideoElement, stream: MediaStream): Promise<void> {
  video.srcObject = stream;
  try {
    await video.play();
  } catch (err) {
    console.warn('Autoplay prevented:', err);
  }
}

  getSupportedConstraints(): MediaTrackSupportedConstraints {
    return navigator.mediaDevices.getSupportedConstraints();
  }

  getAvailableDevices(): MediaDeviceInfo[] {
    return [...this.availableDevices];
  }

  stopAllTracks(stream: MediaStream | null): void {
    if (!stream) return;
    
    stream.getTracks().forEach(track => {
      console.log(`Stopping ${track.kind} track: ${track.label}`);
      track.stop();
    });
    
    // Clean up event handlers
    stream.onremovetrack = null;
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
      throw new Error('Video niet gereed voor foto capture');
    }

    // Create canvas with video dimensions
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas 2D context niet beschikbaar');
    }
    
    // Draw video frame to canvas (mirror horizontally for selfie effect)
    context.scale(-1, 1);
    context.drawImage(video, -video.videoWidth, 0, video.videoWidth, video.videoHeight);
    
    // Convert to JPEG with 80% quality
    return canvas.toDataURL('image/jpeg', 0.8);
  }

  private isVideoReady(video: HTMLVideoElement): boolean {
    return !!(video && 
             video.videoWidth > 0 && 
             video.videoHeight > 0 && 
             video.readyState >= 2);
  }

  // Listen for device changes (camera connect/disconnect)
  onDeviceChange(callback: () => void): void {
    navigator.mediaDevices.addEventListener('devicechange', callback);
  }

  removeDeviceChangeListener(callback: () => void): void {
    navigator.mediaDevices.removeEventListener('devicechange', callback);
  }
}