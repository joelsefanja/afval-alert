import { Component, ElementRef, ViewChild, signal, computed, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { AfvalType } from '@app/models/afval-type.model';
import { AFVAL_CLASSIFICATIE_SERVICE } from '@app/app.config';
import { IAfvalClassificatieService } from '../../services/afval-classificatie.interface';

@Component({
  selector: 'app-foto-opname',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  templateUrl: './foto-opname.html',
  styleUrl: './foto-opname.scss'
})
export class FotoOpnameComponent {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  private afvalService = inject<IAfvalClassificatieService>(AFVAL_CLASSIFICATIE_SERVICE);
  private snackBar = inject(MatSnackBar);
  
  fotoGemaakt = output<Blob>();
  afvalHerkend = output<AfvalType[]>();
  
  getCanvasDataURL(): string | undefined {
    return this.canvasElement?.nativeElement.toDataURL();
  }
  
  private cameraStream = signal<MediaStream | null>(null);
  private gemaakteFoto = signal<Blob | null>(null);
  private herkendeAfvalSoorten = signal<AfvalType[]>([]);
  private bezig = signal<boolean>(false);
  private foutmelding = signal<string | null>(null);
  private handmatigeSelectie = signal<boolean>(false);
  
  readonly heeftCameraStream = computed(() => !!this.cameraStream());
  readonly heeftFoto = computed(() => !!this.gemaakteFoto());
  readonly afvalSoorten = computed(() => this.herkendeAfvalSoorten());
  readonly isBezig = computed(() => this.bezig());
  readonly fout = computed(() => this.foutmelding());
  readonly toonHandmatigeSelectie = computed(() => this.handmatigeSelectie());
  
  readonly beschikbareAfvalSoorten = Object.values(AfvalType);
  
  async startCamera(): Promise<void> {
    try {
      this.foutmelding.set(null);
      this.bezig.set(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      });
      
      this.cameraStream.set(stream);
      
      setTimeout(() => {
        if (this.videoElement?.nativeElement) {
          this.videoElement.nativeElement.srcObject = stream;
        }
      });
      
      this.bezig.set(false);
    } catch (error) {
      this.bezig.set(false);
      this.toonFoutmelding('Camera niet beschikbaar. Probeer een foto te uploaden.');
    }
  }
  
  stopCamera(): void {
    const stream = this.cameraStream();
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      this.cameraStream.set(null);
      
      if (this.videoElement?.nativeElement) {
        this.videoElement.nativeElement.srcObject = null;
      }
    }
  }
  
  maakFoto(): void {
    if (!this.heeftCameraStream()) {
      this.toonFoutmelding('Camera is niet actief');
      return;
    }
    
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');
    
    if (!context) {
      this.toonFoutmelding('Kan geen foto maken');
      return;
    }
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob(async (blob) => {
      if (blob) {
        const geoptimaliseerdeBlob = await this.optimaliseerAfbeelding(blob);
        this.gemaakteFoto.set(geoptimaliseerdeBlob);
        this.fotoGemaakt.emit(geoptimaliseerdeBlob);
        this.stopCamera();
        this.herkenAfval(geoptimaliseerdeBlob);
      } else {
        this.toonFoutmelding('Foto maken mislukt');
      }
    }, 'image/jpeg', 0.8);
  }
  
  verwerkBestandsUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const bestand = input.files[0];
      
      if (!bestand.type.startsWith('image/')) {
        this.toonFoutmelding('Alleen afbeeldingen toegestaan');
        return;
      }
      
      this.verwerkGeuploadBestand(bestand);
    }
  }
  
  private async verwerkGeuploadBestand(bestand: File): Promise<void> {
    try {
      this.bezig.set(true);
      const geoptimaliseerdeBlob = await this.optimaliseerAfbeelding(bestand);
      this.gemaakteFoto.set(geoptimaliseerdeBlob);
      this.fotoGemaakt.emit(geoptimaliseerdeBlob);
      this.herkenAfval(geoptimaliseerdeBlob);
    } catch (error) {
      this.toonFoutmelding('Afbeelding verwerken mislukt');
    } finally {
      this.bezig.set(false);
    }
  }
  
  openBestandsKiezer(): void {
    this.fileInput.nativeElement.click();
  }
  
  private async optimaliseerAfbeelding(afbeelding: Blob | File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Canvas niet beschikbaar'));
          return;
        }
        
        const MAX_GROOTTE = 800;
        let breedte = img.width;
        let hoogte = img.height;
        
        if (breedte > hoogte && breedte > MAX_GROOTTE) {
          hoogte = Math.round((hoogte * MAX_GROOTTE) / breedte);
          breedte = MAX_GROOTTE;
        } else if (hoogte > MAX_GROOTTE) {
          breedte = Math.round((breedte * MAX_GROOTTE) / hoogte);
          hoogte = MAX_GROOTTE;
        }
        
        canvas.width = breedte;
        canvas.height = hoogte;
        ctx.drawImage(img, 0, 0, breedte, hoogte);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Optimaliseren mislukt'));
          }
        }, 'image/jpeg', 0.8);
      };
      
      img.onerror = () => reject(new Error('Afbeelding laden mislukt'));
      img.src = URL.createObjectURL(afbeelding);
    });
  }
  
  async herkenAfval(afbeelding: Blob): Promise<void> {
    try {
      this.bezig.set(true);
      this.foutmelding.set(null);
      
      const resultaten = await this.afvalService.herkenAfvalSoorten(afbeelding);
      
      if (resultaten.length === 0) {
        this.handmatigeSelectie.set(true);
        this.toonFoutmelding('Geen afval herkend. Selecteer handmatig het type afval.');
      } else {
        this.herkendeAfvalSoorten.set(resultaten);
        this.afvalHerkend.emit(resultaten);
      }
    } catch (error) {
      this.handmatigeSelectie.set(true);
      this.toonFoutmelding('Afval herkenning mislukt. Selecteer handmatig het type afval.');
    } finally {
      this.bezig.set(false);
    }
  }
  
  selecteerAfvalSoort(afvalSoort: AfvalType): void {
    const huidigeSelectie = this.herkendeAfvalSoorten();
    if (huidigeSelectie.includes(afvalSoort)) {
      this.herkendeAfvalSoorten.set(huidigeSelectie.filter(soort => soort !== afvalSoort));
    } else {
      this.herkendeAfvalSoorten.set([...huidigeSelectie, afvalSoort]);
    }
  }
  
  bevestigHandmatigeSelectie(): void {
    if (this.herkendeAfvalSoorten().length > 0) {
      this.handmatigeSelectie.set(false);
      this.afvalHerkend.emit(this.herkendeAfvalSoorten());
    } else {
      this.toonFoutmelding('Selecteer minimaal één afvalsoort');
    }
  }
  
  resetFoto(): void {
    this.gemaakteFoto.set(null);
    this.herkendeAfvalSoorten.set([]);
    this.handmatigeSelectie.set(false);
    this.foutmelding.set(null);
  }
  
  private toonFoutmelding(bericht: string): void {
    this.foutmelding.set(bericht);
    this.snackBar.open(bericht, 'Sluiten', { duration: 4000 });
  }
}