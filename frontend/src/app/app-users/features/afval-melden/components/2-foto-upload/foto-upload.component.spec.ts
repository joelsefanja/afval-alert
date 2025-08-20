import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { FotoUploadComponent } from './foto-upload.component';
import { MediaService } from '../../services/media/media.service';
import { ProcesNavigatorService } from '../../services/proces/navigatie';
import { ProcesBuilderService } from '../../services/proces/navigatie';
import { of } from 'rxjs';

describe('FotoUploadComponent', () => {
  let component: FotoUploadComponent;
  let fixture: ComponentFixture<FotoUploadComponent>;
  let mockMediaService: jest.Mocked<MediaService>;
  let mockNavigatorService: jest.Mocked<ProcesNavigatorService>;
  let mockProcesBuilderService: jest.Mocked<ProcesBuilderService>;

  beforeEach(async () => {
    const mediaServiceSpy = {
      cameraActive: signal(false),
      fotoBlob: signal(null),
      detectieResultaat: signal(null),
      isProcessing: signal(false),
      fotoUrl: jest.fn().mockReturnValue(null),
      startCamera: jest.fn().mockResolvedValue(undefined),
      stopCamera: jest.fn(),
      maakFoto: jest.fn().mockResolvedValue(undefined),
      selecteerFoto: jest.fn().mockResolvedValue(undefined),
      reset: jest.fn(),
      heeftFoto: jest.fn().mockReturnValue(false),
      classificeerFoto: jest.fn().mockResolvedValue(null),
      fileSelectionCancelled: of()
    } as unknown as jest.Mocked<MediaService>;

    const navigatorServiceSpy = {
      volgende: jest.fn()
    } as unknown as jest.Mocked<ProcesNavigatorService>;

    const procesBuilderServiceSpy = {
      vorige: jest.fn()
    } as unknown as jest.Mocked<ProcesBuilderService>;

    await TestBed.configureTestingModule({
      imports: [FotoUploadComponent],
      providers: [
        { provide: MediaService, useValue: mediaServiceSpy },
        { provide: ProcesNavigatorService, useValue: navigatorServiceSpy },
        { provide: ProcesBuilderService, useValue: procesBuilderServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FotoUploadComponent);
    component = fixture.componentInstance;
    
    mockMediaService = TestBed.inject(MediaService) as jest.Mocked<MediaService>;
    mockNavigatorService = TestBed.inject(ProcesNavigatorService) as jest.Mocked<ProcesNavigatorService>;
    mockProcesBuilderService = TestBed.inject(ProcesBuilderService) as jest.Mocked<ProcesBuilderService>;

    // Mock the video element
    Object.defineProperty(component, 'videoRef', {
      writable: true,
      value: {
        nativeElement: document.createElement('video')
      }
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('startCamera', () => {
    it('should call mediaService.startCamera when video element is available', async () => {
      await component.startCamera();
      
      expect(mockMediaService.startCamera).toHaveBeenCalledWith(component['videoRef'].nativeElement);
    });

    it('should handle error when startCamera fails', async () => {
      const error = new Error('Camera error');
      mockMediaService.startCamera.mockRejectedValueOnce(error);
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await component.startCamera();
      
      expect(mockMediaService.startCamera).toHaveBeenCalledWith(component['videoRef'].nativeElement);
      expect(component.cameraError()).toBeTruthy();
      
      consoleSpy.mockRestore();
    });
  });

  describe('stopCamera', () => {
    it('should call mediaService.stopCamera', () => {
      component.stopCamera();
      
      expect(mockMediaService.stopCamera).toHaveBeenCalled();
    });
  });

  describe('maakFoto', () => {
    it('should call mediaService.maakFoto when video element is available', () => {
      component.maakFoto();
      
      expect(mockMediaService.maakFoto).toHaveBeenCalledWith(component['videoRef'].nativeElement);
    });
  });

  describe('selecteerFoto', () => {
    it('should call mediaService.selecteerFoto', () => {
      component.selecteerFoto();
      
      expect(mockMediaService.selecteerFoto).toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('should call mediaService.reset', () => {
      component.reset();
      
      expect(mockMediaService.reset).toHaveBeenCalled();
    });
  });

  describe('volgende', () => {
    it('should call navigatorService.volgende', () => {
      component.volgende();
      
      expect(mockNavigatorService.volgende).toHaveBeenCalled();
    });
  });

  describe('annuleerEnGaTerug', () => {
    it('should call procesBuilderService.vorige', () => {
      component.annuleerEnGaTerug();
      
      expect(mockProcesBuilderService.vorige).toHaveBeenCalled();
    });
  });
});