import { TestBed } from '@angular/core/testing';
import { CameraService } from './camera.service';

describe('CameraService', () => {
  let service: CameraService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CameraService]
    });
    service = TestBed.inject(CameraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUserMedia', () => {
    let originalMediaDevices: MediaDevices | undefined;

    beforeEach(() => {
      originalMediaDevices = navigator.mediaDevices;
    });

    afterEach(() => {
      Object.defineProperty(navigator, 'mediaDevices', {
        writable: true,
        value: originalMediaDevices
      });
    });

    it('should throw error when mediaDevices is not supported', async () => {
      Object.defineProperty(navigator, 'mediaDevices', {
        writable: true,
        value: undefined
      });

      await expectAsync(service.getUserMedia()).toBeRejectedWithError('Camera API niet ondersteund in deze browser');
    });

    it('should request camera access with ideal settings', async () => {
      const mockStream = new MediaStream();
      const mockGetUserMedia = jasmine.createSpy().and.resolveTo(mockStream);

      Object.defineProperty(navigator, 'mediaDevices', {
        writable: true,
        value: {
          getUserMedia: mockGetUserMedia
        }
      });

      const result = await service.getUserMedia();

      expect(mockGetUserMedia).toHaveBeenCalledWith({
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: 'environment'
        },
        audio: false
      });
      expect(result).toBe(mockStream);
    });

    it('should fallback to basic constraints when ideal settings fail', async () => {
      const mockStream = new MediaStream();
      const mockGetUserMedia = jasmine.createSpy()
        .and.rejectWith(new Error('Ideal settings failed'))
        .and.resolveTo(mockStream);

      Object.defineProperty(navigator, 'mediaDevices', {
        writable: true,
        value: {
          getUserMedia: mockGetUserMedia
        }
      });

      const result = await service.getUserMedia();

      expect(mockGetUserMedia).toHaveBeenCalledTimes(2);
      expect(mockGetUserMedia).toHaveBeenCalledWith({
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: 'environment'
        },
        audio: false
      });
      expect(mockGetUserMedia).toHaveBeenCalledWith({
        video: true,
        audio: false
      });
      expect(result).toBe(mockStream);
    });

    it('should throw error when both ideal and fallback settings fail', async () => {
      const mockGetUserMedia = jasmine.createSpy()
        .and.rejectWith(new Error('Ideal settings failed'))
        .and.rejectWith(new Error('Fallback failed'));

      Object.defineProperty(navigator, 'mediaDevices', {
        writable: true,
        value: {
          getUserMedia: mockGetUserMedia
        }
      });

      await expectAsync(service.getUserMedia()).toBeRejectedWithError('Fallback failed');
      expect(mockGetUserMedia).toHaveBeenCalledTimes(2);
    });
  });

  describe('captureFrame', () => {
    it('should capture frame from video element as blob', async () => {
      const videoElement = document.createElement('video');
      videoElement.width = 640;
      videoElement.height = 480;
      
      // Mock canvas context
      const mockContext = {
        drawImage: jasmine.createSpy(),
      };
      
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: jasmine.createSpy().and.returnValue(mockContext),
        toBlob: jasmine.createSpy().and.callFake((callback) => {
          callback(new Blob(['test'], { type: 'image/jpeg' }));
        })
      };
      
      // Mock document.createElement to return our mock canvas
      const originalCreateElement = document.createElement;
      spyOn(document, 'createElement').and.callFake((tagName: string) => {
        if (tagName === 'canvas') {
          return mockCanvas as any;
        }
        return originalCreateElement.call(document, tagName);
      });
      
      const result = await service.captureFrame(videoElement);
      
      expect(result).toBeInstanceOf(Blob);
      expect(mockContext.drawImage).toHaveBeenCalledWith(videoElement, 0, 0);
      
      // Restore original createElement
      document.createElement = originalCreateElement;
    });

    it('should throw error when canvas context is not available', async () => {
      const videoElement = document.createElement('video');
      
      // Mock document.createElement to return a canvas without context
      const originalCreateElement = document.createElement;
      spyOn(document, 'createElement').and.callFake((tagName: string) => {
        if (tagName === 'canvas') {
          return {
            getContext: jasmine.createSpy().and.returnValue(null)
          } as any;
        }
        return originalCreateElement.call(document, tagName);
      });
      
      await expectAsync(service.captureFrame(videoElement)).toBeRejectedWithError('Canvas context niet beschikbaar');
      
      // Restore original createElement
      document.createElement = originalCreateElement;
    });
  });

  describe('selectFromDevice', () => {
    it('should create file input and resolve with selected file', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      // Mock document.createElement to return our mock input
      const originalCreateElement = document.createElement;
      const mockInput = {
        type: '',
        accept: '',
        capture: '',
        onclick: null as Function | null,
        onchange: null as Function | null,
        click: jasmine.createSpy()
      };
      
      spyOn(document, 'createElement').and.callFake((tagName: string) => {
        if (tagName === 'input') {
          return mockInput as any;
        }
        return originalCreateElement.call(document, tagName);
      });
      
      // Start the promise
      const promise = service.selectFromDevice();
      
      // Simulate file selection
      if (mockInput.onchange) {
        Object.defineProperty(mockInput, 'files', {
          value: [mockFile],
          writable: false
        });
        mockInput.onchange({ target: mockInput } as any);
      }
      
      const result = await promise;
      
      expect(result).toBe(mockFile);
      expect(mockInput.type).toBe('file');
      expect(mockInput.accept).toBe('image/*');
      expect(mockInput.capture).toBe('environment');
      expect(mockInput.click).toHaveBeenCalled();
      
      // Restore original createElement
      document.createElement = originalCreateElement;
    });

    it('should reject when no file is selected', async () => {
      // Mock document.createElement to return our mock input
      const originalCreateElement = document.createElement;
      const mockInput = {
        type: '',
        accept: '',
        capture: '',
        onclick: null as Function | null,
        onchange: null as Function | null,
        click: jasmine.createSpy()
      };
      
      spyOn(document, 'createElement').and.callFake((tagName: string) => {
        if (tagName === 'input') {
          return mockInput as any;
        }
        return originalCreateElement.call(document, tagName);
      });
      
      // Start the promise
      const promise = service.selectFromDevice();
      
      // Simulate no file selection
      if (mockInput.onchange) {
        Object.defineProperty(mockInput, 'files', {
          value: [],
          writable: false
        });
        mockInput.onchange({ target: mockInput } as any);
      }
      
      await expectAsync(promise).toBeRejectedWithError('Geen foto geselecteerd');
      
      // Restore original createElement
      document.createElement = originalCreateElement;
    });
  });

  describe('stopTracks', () => {
    it('should stop all tracks in media stream', () => {
      const mockTrack = { stop: jasmine.createSpy() };
      const mockStream = {
        getTracks: jasmine.createSpy().and.returnValue([mockTrack])
      } as unknown as MediaStream;
      
      service.stopTracks(mockStream);
      
      expect(mockTrack.stop).toHaveBeenCalled();
      expect(mockStream.getTracks).toHaveBeenCalled();
    });
  });
});