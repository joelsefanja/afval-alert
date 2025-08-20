import { TestBed } from '@angular/core/testing';
import { MediaService } from './media.service';
import { CameraService } from './camera.service';
import { of } from 'rxjs';

// Mock for the AI service
const mockAiService = {
  classificeerAfval: jest.fn()
};

// Token for the AI service
const AFVAL_CLASSIFICATIE_SERVICE = 'AFVAL_CLASSIFICATIE_SERVICE';

describe('MediaService', () => {
  let service: MediaService;
  let mockCameraService: jest.Mocked<CameraService>;

  beforeEach(() => {
    const cameraServiceSpy = {
      getUserMedia: jest.fn(),
      stopTracks: jest.fn(),
      captureFrame: jest.fn(),
      selectFromDevice: jest.fn(),
      fileSelectionCancelled: of()
    } as unknown as jest.Mocked<CameraService>;

    TestBed.configureTestingModule({
      providers: [
        MediaService,
        { provide: CameraService, useValue: cameraServiceSpy },
        { provide: AFVAL_CLASSIFICATIE_SERVICE, useValue: mockAiService }
      ]
    });

    service = TestBed.inject(MediaService);
    mockCameraService = TestBed.inject(CameraService) as jest.Mocked<CameraService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('startCamera', () => {
    it('should start camera and set stream', async () => {
      const mockStream = new MediaStream();
      const mockVideoElement = document.createElement('video');
      
      mockCameraService.getUserMedia.mockResolvedValue(mockStream);
      
      await service.startCamera(mockVideoElement);
      
      expect(service.cameraActive()).toBe(true);
      expect(service.stream$()).toBe(mockStream);
      expect(mockVideoElement.srcObject).toBe(mockStream);
    });

    it('should stop existing stream before starting new one', async () => {
      const mockStream1 = new MediaStream();
      const mockStream2 = new MediaStream();
      const mockVideoElement = document.createElement('video');
      
      mockCameraService.getUserMedia
        .mockResolvedValueOnce(mockStream1)
        .mockResolvedValueOnce(mockStream2);
      
      // Start first stream
      await service.startCamera(mockVideoElement);
      expect(service.stream$()).toBe(mockStream1);
      
      // Start second stream
      await service.startCamera(mockVideoElement);
      expect(service.stream$()).toBe(mockStream2);
      expect(mockCameraService.stopTracks).toHaveBeenCalledWith(mockStream1);
    });

    it('should handle errors properly', async () => {
      const mockVideoElement = document.createElement('video');
      const error = new Error('Camera error');
      
      mockCameraService.getUserMedia.mockRejectedValue(error);
      
      await expect(service.startCamera(mockVideoElement)).rejects.toThrow(error);
      expect(service.cameraActive()).toBe(false);
      expect(service.stream$()).toBe(null);
    });
  });

  describe('stopCamera', () => {
    it('should stop camera and clear stream', async () => {
      const mockStream = new MediaStream();
      const mockVideoElement = document.createElement('video');
      
      mockCameraService.getUserMedia.mockResolvedValue(mockStream);
      
      // Start camera first
      await service.startCamera(mockVideoElement);
      expect(service.cameraActive()).toBe(true);
      
      // Stop camera
      service.stopCamera();
      
      expect(service.cameraActive()).toBe(false);
      expect(service.stream$()).toBe(null);
      expect(mockCameraService.stopTracks).toHaveBeenCalledWith(mockStream);
    });

    it('should do nothing if no stream is active', () => {
      service.stopCamera();
      
      expect(service.cameraActive()).toBe(false);
      expect(mockCameraService.stopTracks).not.toHaveBeenCalled();
    });
  });

  describe('maakFoto', () => {
    it('should capture frame and set fotoBlob', async () => {
      const mockVideoElement = document.createElement('video');
      const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
      
      mockCameraService.captureFrame.mockResolvedValue(mockBlob);
      
      await service.maakFoto(mockVideoElement);
      
      expect(service.fotoBlob()).toEqual(mockBlob);
      expect(service.cameraActive()).toBe(false); // Camera should be stopped after capture
    });

    it('should throw error if video element is not provided', async () => {
      await expect(service.maakFoto(null as any)).rejects.toThrow();
    });
  });

  describe('selecteerFoto', () => {
    it('should select photo from device and set fotoBlob', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
      
      mockCameraService.selectFromDevice.mockResolvedValue(mockBlob);
      
      await service.selecteerFoto();
      
      expect(service.fotoBlob()).toEqual(mockBlob);
    });

    it('should emit fileSelectionCancelled event when selection is cancelled', async () => {
      const error = new Error('Geen foto geselecteerd');
      mockCameraService.selectFromDevice.mockRejectedValue(error);
      
      const cancelSpy = jest.fn();
      service.fileSelectionCancelled.subscribe(cancelSpy);
      
      try {
        await service.selecteerFoto();
      } catch (e) {
        // Expected error
      }
      
      expect(cancelSpy).toHaveBeenCalled();
    });
  });

  describe('classificeerFoto', () => {
    it('should classify photo when fotoBlob is available', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
      const mockResult = { afvalType: 'plastic', confidence: 0.95 };
      
      // Set up the service state
      (service as any).fotoBlob.set(mockBlob);
      mockAiService.classificeerAfval.mockResolvedValue(mockResult);
      
      const result = await service.classificeerFoto();
      
      expect(result).toEqual(mockResult);
      expect(service.classificatieResultaat()).toEqual(mockResult);
    });

    it('should return null when no fotoBlob is available', async () => {
      // Ensure no photo is set
      (service as any).fotoBlob.set(null);
      
      const result = await service.classificeerFoto();
      
      expect(result).toBeNull();
      expect(mockAiService.classificeerAfval).not.toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('should reset all state', async () => {
      const mockStream = new MediaStream();
      const mockVideoElement = document.createElement('video');
      const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
      
      // Set up service state
      mockCameraService.getUserMedia.mockResolvedValue(mockStream);
      await service.startCamera(mockVideoElement);
      (service as any).fotoBlob.set(mockBlob);
      (service as any).classificatieResultaat.set({ afvalType: 'plastic', confidence: 0.95 });
      (service as any).isProcessing.set(true);
      
      // Reset
      service.reset();
      
      expect(service.cameraActive()).toBe(false);
      expect(service.fotoBlob()).toBe(null);
      expect(service.classificatieResultaat()).toBe(null);
      expect(service.isProcessing()).toBe(false);
      expect(mockCameraService.stopTracks).toHaveBeenCalledWith(mockStream);
    });
  });

  describe('computed signals', () => {
    it('should compute heeftFoto correctly', () => {
      expect(service.heeftFoto()).toBe(false);
      
      (service as any).fotoBlob.set(new Blob(['test']));
      expect(service.heeftFoto()).toBe(true);
    });

    it('should compute fotoUrl correctly', () => {
      expect(service.fotoUrl()).toBe(null);
      
      const mockBlob = new Blob(['test']);
      (service as any).fotoBlob.set(mockBlob);
      expect(service.fotoUrl()).toBeTruthy(); // Should return a blob URL
    });

    it('should compute kanClassificeren correctly', () => {
      // No photo, not processing
      (service as any).fotoBlob.set(null);
      (service as any).isProcessing.set(false);
      expect(service.kanClassificeren()).toBe(false);
      
      // Has photo, not processing
      (service as any).fotoBlob.set(new Blob(['test']));
      (service as any).isProcessing.set(false);
      expect(service.kanClassificeren()).toBe(true);
      
      // Has photo, processing
      (service as any).fotoBlob.set(new Blob(['test']));
      (service as any).isProcessing.set(true);
      expect(service.kanClassificeren()).toBe(false);
    });
  });
});