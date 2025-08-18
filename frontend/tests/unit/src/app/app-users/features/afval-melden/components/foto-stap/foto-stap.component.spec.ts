import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { FotoStapComponent } from '../../../../../../../src/app/app-users/features/afval-melden/components/foto-stap/foto-stap.component';
import { MeldingsProcedureStatus } from '../../../../../../../src/app/app-users/features/afval-melden/services/melding/melding-state.service';
import { FotoFacadeService } from '../../../../../../../src/app/app-users/features/afval-melden/services/media/foto-facade.service';
import { CameraService } from '../../../../../../../src/app/app-users/features/afval-melden/services/media/camera.service';
import { ElementRef } from '@angular/core';

describe('FotoStapComponent', () => {
  let component: FotoStapComponent;
  let fixture: ComponentFixture<FotoStapComponent>;
  let mockMeldingsProcedureStatus: jest.Mocked<MeldingsProcedureStatus>;
  let mockFotoFacade: jest.Mocked<FotoFacadeService>;
  let mockCameraService: jest.Mocked<CameraService>;

  beforeEach(async () => {
    // Mock services
    const meldingsSpy = {
      gaTerugNaarVorige: jest.fn(),
      gaNaarVolgende: jest.fn(),
      fotoUrl: signal(''),
      fotoError: signal('')
    } as unknown as jest.Mocked<MeldingsProcedureStatus>;

    const fotoFacadeSpy = {
      fotoState: signal({
        cameraActive: false,
        isLoading: false,
        hasPhoto: false,
        photoUrl: '',
        errorMessage: ''
      }),
      startCamera: jest.fn(),
      stopCamera: jest.fn(),
      capturePhoto: jest.fn(),
      selectFromGallery: jest.fn(),
      cancelPhoto: jest.fn()
    } as unknown as jest.Mocked<FotoFacadeService>;

    const cameraSpy = {
      attachStreamToVideo: jest.fn(),
      playVideo: jest.fn(),
      stopAllTracks: jest.fn()
    } as unknown as jest.Mocked<CameraService>;

    await TestBed.configureTestingModule({
      imports: [FotoStapComponent],
      providers: [
        { provide: MeldingsProcedureStatus, useValue: meldingsSpy },
        { provide: FotoFacadeService, useValue: fotoFacadeSpy },
        { provide: CameraService, useValue: cameraSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FotoStapComponent);
    component = fixture.componentInstance;
    mockMeldingsProcedureStatus = TestBed.inject(MeldingsProcedureStatus) as jest.Mocked<MeldingsProcedureStatus>;
    mockFotoFacade = TestBed.inject(FotoFacadeService) as jest.Mocked<FotoFacadeService>;
    mockCameraService = TestBed.inject(CameraService) as jest.Mocked<CameraService>;
  });

  describe('Component Creation', () => {
    it('should create component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with correct facade state', () => {
      expect(component['fotoState']).toBeDefined();
    });
  });

  describe('Navigation', () => {
    it('should call facade and emit events on terug', () => {
      const terugSpy = jest.spyOn(component['navigatieTerug'], 'emit');
      
      component['terug']();
      
      expect(mockFotoFacade.stopCamera).toHaveBeenCalledTimes(1);
      expect(terugSpy).toHaveBeenCalledTimes(1);
      expect(mockMeldingsProcedureStatus.gaTerugNaarVorige).toHaveBeenCalledTimes(1);
    });

    it('should call facade and emit events on volgende', () => {
      const volgendeSpy = jest.spyOn(component['navigatieVolgende'], 'emit');
      
      component['volgende']();
      
      expect(mockFotoFacade.stopCamera).toHaveBeenCalledTimes(1);
      expect(volgendeSpy).toHaveBeenCalledTimes(1);
      expect(mockMeldingsProcedureStatus.gaNaarVolgende).toHaveBeenCalledTimes(1);
    });
  });

  describe('Photo Actions', () => {
    it('should call facade cancelPhoto on annuleerFoto', () => {
      component['annuleerFoto']();
      
      expect(mockFotoFacade.cancelPhoto).toHaveBeenCalledTimes(1);
    });

    it('should start camera through facade', async () => {
      mockFotoFacade.startCamera.mockResolvedValue({} as any);
      
      await component['startCamera']();
      
      expect(mockFotoFacade.startCamera).toHaveBeenCalledTimes(1);
    });

    it('should handle camera start errors gracefully', async () => {
      mockFotoFacade.startCamera.mockRejectedValue(new Error('Camera not available'));
      
      await expect(component['startCamera']()).resolves.not.toThrow();
    });

    it('should capture photo through facade', async () => {
      const mockVideo = { videoWidth: 640, videoHeight: 480 } as HTMLVideoElement;
      component['videoRef'] = { nativeElement: mockVideo } as ElementRef<HTMLVideoElement>;
      mockFotoFacade.capturePhoto.mockResolvedValue('data:image/jpeg;base64,...');
      const fotoGemaaktSpy = jest.spyOn(component['fotoGemaakt'], 'emit');
      
      await component['maakFoto']();
      
      expect(mockFotoFacade.capturePhoto).toHaveBeenCalledWith(mockVideo);
      expect(fotoGemaaktSpy).toHaveBeenCalledWith('data:image/jpeg;base64,...');
    });

    it('should not capture photo when disabled', async () => {
      component.disabled = signal(true);
      
      await component['maakFoto']();
      
      expect(mockFotoFacade.capturePhoto).not.toHaveBeenCalled();
    });

    it('should not capture photo without video element', async () => {
      component['videoRef'] = undefined as any;
      
      await component['maakFoto']();
      
      expect(mockFotoFacade.capturePhoto).not.toHaveBeenCalled();
    });

    it('should select from gallery through facade', async () => {
      mockFotoFacade.selectFromGallery.mockResolvedValue('data:image/jpeg;base64,...');
      const fotoGemaaktSpy = jest.spyOn(component['fotoGemaakt'], 'emit');
      
      await component['kiesFotoUitGalerij']();
      
      expect(mockFotoFacade.selectFromGallery).toHaveBeenCalledTimes(1);
      expect(fotoGemaaktSpy).toHaveBeenCalledWith('data:image/jpeg;base64,...');
    });
  });

  describe('Video Management', () => {
    it('should handle video loaded event', () => {
      const mockVideo = {} as HTMLVideoElement;
      const mockStream = {} as MediaStream;
      component['videoStream'] = mockStream;
      
      component['onVideoLoaded'](mockVideo);
      
      expect(mockCameraService.attachStreamToVideo).toHaveBeenCalledWith(mockVideo, mockStream);
    });

    it('should not handle video loaded without stream', () => {
      const mockVideo = {} as HTMLVideoElement;
      component['videoStream'] = null;
      
      component['onVideoLoaded'](mockVideo);
      
      expect(mockCameraService.attachStreamToVideo).not.toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should call facade stopCamera on destroy', () => {
      component.ngOnDestroy();
      
      expect(mockFotoFacade.stopCamera).toHaveBeenCalledTimes(1);
    });

    it('should cleanup video element on stopCamera', () => {
      const mockVideo = { srcObject: {}, pause: jest.fn() } as any;
      component['videoRef'] = { nativeElement: mockVideo } as ElementRef<HTMLVideoElement>;
      
      component['stopCamera']();
      
      expect(mockFotoFacade.stopCamera).toHaveBeenCalledTimes(1);
      expect(mockCameraService.stopAllTracks).toHaveBeenCalledWith(mockVideo.srcObject);
      expect(mockVideo.srcObject).toBeNull();
      expect(mockVideo.pause).toHaveBeenCalledTimes(1);
    });
  });
});