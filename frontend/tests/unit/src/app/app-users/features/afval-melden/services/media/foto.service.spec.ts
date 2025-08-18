import { TestBed } from '@angular/core/testing';
import { FotoService } from './foto.service';

describe('FotoService', () => {
  let service: FotoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FotoService);
  });

  it('moet service aanmaken', () => {
    expect(service).toBeTruthy();
  });

  describe('blobToDataUrl', () => {
    it('moet blob omzetten naar data URL', async () => {
      const testContent = 'test content';
      const blob = new Blob([testContent], { type: 'text/plain' });
      
      const dataUrl = await service.blobToDataUrl(blob);
      
      expect(dataUrl).toMatch(/^data:text\/plain;base64,/);
    });

    it('moet fout gooien bij ongeldige blob', async () => {
      const invalidBlob = null as any;
      
      await expect(service.blobToDataUrl(invalidBlob))
        .rejects.toThrow();
    });
  });

  describe('validateFoto', () => {
    it('moet geldig bestand accepteren', () => {
      const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      const result = service.validateFoto(validFile);
      
      expect(result).toBeNull();
    });

    it('moet niet-afbeelding afwijzen', () => {
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      
      const result = service.validateFoto(invalidFile);
      
      expect(result).toBe('Alleen afbeeldingen toegestaan');
    });

    it('moet te groot bestand afwijzen', () => {
      const hugeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'huge.jpg', { 
        type: 'image/jpeg' 
      });
      
      const result = service.validateFoto(hugeFile);
      
      expect(result).toBe('Afbeelding te groot (max 10MB)');
    });
  });

  describe('optimaliseerFoto', () => {
    it('moet afbeelding optimaliseren', async () => {
      // Mock canvas context
      const mockCanvas = {
        getContext: jest.fn(),
        toBlob: jest.fn(),
        width: 0,
        height: 0
      };
      const mockContext = {
        drawImage: jest.fn()
      };
      mockCanvas.getContext.mockReturnValue(mockContext);
      jest.spyOn(document, 'createElement').mockReturnValue(mockCanvas as any);
      
      // Mock toBlob
      mockCanvas.toBlob.mockImplementation((callback: any) => {
        callback(new Blob(['optimized'], { type: 'image/jpeg' }));
      });
      
      // Mock Image
      const mockImage = {
        onload: null as any,
        onerror: null as any,
        src: '',
        width: 800,
        height: 600
      };
      (global as any).Image = jest.fn(() => mockImage);
      
      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      // Trigger onload synchronously
      const optimizePromise = service.optimaliseerFoto(testFile);
      
      // Immediately trigger onload
      if (mockImage.onload) {
        mockImage.onload({} as Event);
      }
      
      const result = await optimizePromise;
      
      expect(result).toBeInstanceOf(Blob);
    });
  });
});