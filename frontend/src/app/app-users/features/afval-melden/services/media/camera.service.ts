import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CameraService {
  async getUserMedia(): Promise<MediaStream> {
    return navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: 1280, height: 720 },
      audio: false
    });
  }

  captureFrame(video: HTMLVideoElement): string {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.8);
  }

  stopTracks(stream: MediaStream): void {
    stream.getTracks().forEach(track => track.stop());
  }

  selectFromDevice(): Promise<string> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        } else reject(new Error('No file selected'));
      };
      input.click();
    });
  }
}