import { Component, inject, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { ImageModule } from 'primeng/image';
import { FotoStapService } from '../../services/media/foto-stap.service';

@Component({
  selector: 'app-foto-stap',
  standalone: true,
  imports: [ButtonModule, CardModule, MessageModule, ImageModule],
  templateUrl: './foto-stap.component.html'
})
export class FotoStapComponent implements OnDestroy {
  private fotoService: FotoStapService = inject(FotoStapService);
  
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
  
  readonly cameraActive = this.fotoService.cameraActive;
  readonly fotoUrl = this.fotoService.fotoUrl;

  ngOnDestroy() {
    this.fotoService.stopCamera();
  }

  async startCamera() {
    try {
      const stream = await this.fotoService.startCamera();
      setTimeout(() => {
        if (this.videoRef?.nativeElement) {
          this.videoRef.nativeElement.srcObject = stream;
        }
      });
    } catch (error) {
      console.error('Camera error:', error);
    }
  }

  async takeFoto() {
    if (!this.videoRef?.nativeElement) return;
    this.fotoService.takeFoto(this.videoRef.nativeElement);
  }

  async selectFromGallery() {
    try {
      await this.fotoService.selectFromGallery();
    } catch (error) {
      console.error('Gallery selection failed:', error);
    }
  }

  reset() {
    this.fotoService.reset();
  }

  next() {
    this.fotoService.next();
  }
}