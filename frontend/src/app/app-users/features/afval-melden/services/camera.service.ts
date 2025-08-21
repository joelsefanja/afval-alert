import { Injectable, OnDestroy } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CameraService implements OnDestroy {
  // ===== Status =====
  private stream?: MediaStream;
  private foto?: Blob;
  private fotoUrl = '';
  private foutmelding = '';

  // ===== Getters =====
  get cameraIsActief() { return !!this.stream; }
  get fotoIsBeschikbaar() { return !!this.foto; }
  get fotoURL() { return this.fotoUrl; }
  get cameraFout() { return this.foutmelding; }
  get fotoGrootteKB() { return this.foto ? Math.round(this.foto.size / 1024) : 0; }

  // ===== Camera Acties =====
  startCamera = async (): Promise<MediaStream> => {
    this.foutmelding = '';
    if (!navigator.mediaDevices?.getUserMedia)
      return this.throwFout('Camera niet beschikbaar');

    try {
      return this.stream = await navigator.mediaDevices.getUserMedia(this.videoConstraints());
    } catch (err) {
      return this.throwFout(this.vertaalCameraFout(err));
    }
  }

  stopCamera = (): void => { this.stream?.getTracks().forEach(t => t.stop()); this.stream = undefined; }

  // ===== Foto Acties =====
  maakFoto = async (video: HTMLVideoElement): Promise<void> => {
    if (!video || !this.stream) throw new Error('Geen actieve camera');
    const canvas = this.createCanvas(video.videoWidth, video.videoHeight);
    this.drawVideo(canvas, video);
    const blob = await this.canvasToBlob(canvas);
    this.slaFotoOp(blob);
  }

  selecteerFoto = async (): Promise<void> => {
    this.stopCamera(); // camera meteen stoppen bij upload
    const blob = await this.promptFotoSelectie();
    this.slaFotoOp(blob);
  }

  verwijderFoto = (): void => {
    if (this.fotoUrl) URL.revokeObjectURL(this.fotoUrl);
    this.foto = undefined;
    this.fotoUrl = '';
  }

  krijgFotoVoorUpload = () => this.foto;

  maakFormData = (veldNaam = 'foto'): FormData | undefined =>
    this.foto ? this.toFormData(this.foto, veldNaam) : undefined;

  reset = (): void => { this.stopCamera(); this.verwijderFoto(); this.foutmelding = ''; }

  ngOnDestroy = (): void => this.reset();

  // ===== Helpers =====
  private videoConstraints = () => ({
    video: { width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: 'environment' },
    audio: false
  });

  private createCanvas = (w: number, h: number) =>
    Object.assign(document.createElement('canvas'), { width: w, height: h });

  private drawVideo = (canvas: HTMLCanvasElement, video: HTMLVideoElement) =>
    canvas.getContext('2d')?.drawImage(video, 0, 0);

  private canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> =>
    new Promise((res, rej) =>
      canvas.toBlob(b => b ? res(b) : rej(new Error('Foto maken mislukt')), 'image/jpeg', 0.9)
    );

  private promptFotoSelectie = (): Promise<Blob> =>
    new Promise((res, rej) => {
      const input = Object.assign(document.createElement('input'), {
        type: 'file', accept: 'image/*', capture: 'environment',
        onchange: (e: Event) => {
          const f = (e.target as HTMLInputElement).files?.[0];
          f ? res(f) : rej(new Error('Geen foto'));
          input.remove();
        }
      });
      input.click();
      setTimeout(() => rej(new Error('Timeout')), 30000);
    });

  private slaFotoOp = (blob: Blob): void => {
    if (this.fotoUrl) URL.revokeObjectURL(this.fotoUrl);
    this.foto = blob;
    this.fotoUrl = URL.createObjectURL(blob);
  }

  private toFormData = (blob: Blob, veld: string) => {
    const fd = new FormData();
    fd.append(veld, blob, 'foto.jpg');
    return fd;
  }

  // ===== Foutafhandeling =====
  private throwFout = (msg: string): never => {
    this.foutmelding = msg;
    this.stream = undefined;
    throw new Error(msg);
  }

  private vertaalCameraFout = (err: unknown): string => {
    if (err instanceof DOMException)
      return ({
        NotFoundError: 'Geen camera gevonden',
        NotAllowedError: 'Camera toegang geweigerd',
        NotReadableError: 'Camera in gebruik',
        OverconstrainedError: 'Camera instellingen niet ondersteund'
      }[err.name] ?? `Camera fout: ${err.message}`);
    return err instanceof Error ? err.message : 'Onbekende camera fout';
  }
}
