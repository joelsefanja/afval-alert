import { TestBed } from '@angular/core/testing';
import { AfvalHerkenningMockService } from './afval-herkenning-mock.service';
import { AfbeeldingUploadRequest } from '../../../../models/afval-herkenning';

describe('AfvalHerkenningMockService', () => {
  let service: AfvalHerkenningMockService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AfvalHerkenningMockService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should upload and recognize image successfully', (done) => {
    const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
    const request: AfbeeldingUploadRequest = { afbeelding: mockBlob };

    service.uploadEnHerkenAfbeelding(request).subscribe({
      next: (response) => {
        expect(response).toBeDefined();
        expect(response.meldingId).toBeDefined();
        expect(response.meldingId).toMatch(/^melding-\d+-[a-z0-9]+$/);
        expect(response.afvalTypes).toBeDefined();
        expect(response.afvalTypes.length).toBeGreaterThan(0);
        expect(response.afvalTypes.length).toBeLessThanOrEqual(3);
        expect(response.weetje).toBeDefined();
        expect(response.weetje.length).toBeGreaterThan(0);
        done();
      },
      error: (error) => {
        fail('Should not have failed: ' + error.message);
      }
    });
  });

  it('should return valid afval types', (done) => {
    const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
    const request: AfbeeldingUploadRequest = { afbeelding: mockBlob };

    service.uploadEnHerkenAfbeelding(request).subscribe({
      next: (response) => {
        response.afvalTypes.forEach(type => {
          expect(type.id).toBeDefined();
          expect(type.naam).toBeDefined();
          expect(type.beschrijving).toBeDefined();
          expect(type.kleur).toMatch(/^#[0-9A-F]{6}$/i);
          expect(type.icoon).toBeDefined();
        });
        done();
      }
    });
  });

  it('should return educational weetje', (done) => {
    const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
    const request: AfbeeldingUploadRequest = { afbeelding: mockBlob };

    service.uploadEnHerkenAfbeelding(request).subscribe({
      next: (response) => {
        expect(response.weetje).toContain('Wist je dat');
        expect(response.weetje.length).toBeGreaterThan(20);
        done();
      }
    });
  });

  it('should simulate processing delay', (done) => {
    const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
    const request: AfbeeldingUploadRequest = { afbeelding: mockBlob };
    const startTime = Date.now();

    service.uploadEnHerkenAfbeelding(request).subscribe({
      next: () => {
        const processingTime = Date.now() - startTime;
        expect(processingTime).toBeGreaterThan(1000); // At least 1 second
        expect(processingTime).toBeLessThan(4000); // Less than 4 seconds
        done();
      }
    });
  });

  it('should occasionally simulate errors', (done) => {
    const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
    const request: AfbeeldingUploadRequest = { afbeelding: mockBlob };
    let errorCount = 0;
    let successCount = 0;
    const totalTests = 20;

    // Run multiple tests to check error rate
    for (let i = 0; i < totalTests; i++) {
      service.uploadEnHerkenAfbeelding(request).subscribe({
        next: () => {
          successCount++;
          if (successCount + errorCount === totalTests) {
            // Should have mostly successes with occasional errors
            expect(successCount).toBeGreaterThan(totalTests * 0.8);
            expect(errorCount).toBeLessThan(totalTests * 0.2);
            done();
          }
        },
        error: () => {
          errorCount++;
          if (successCount + errorCount === totalTests) {
            expect(successCount).toBeGreaterThan(totalTests * 0.8);
            expect(errorCount).toBeLessThan(totalTests * 0.2);
            done();
          }
        }
      });
    }
  });

  it('should check service availability', (done) => {
    service.isServiceBeschikbaar().subscribe({
      next: (available) => {
        expect(typeof available).toBe('boolean');
        // Should be mostly available (90% uptime simulation)
        expect(available).toBe(true);
        done();
      }
    });
  });

  it('should generate unique melding IDs', (done) => {
    const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
    const request: AfbeeldingUploadRequest = { afbeelding: mockBlob };
    const ids = new Set<string>();
    let completedRequests = 0;
    const totalRequests = 5;

    for (let i = 0; i < totalRequests; i++) {
      service.uploadEnHerkenAfbeelding(request).subscribe({
        next: (response) => {
          ids.add(response.meldingId);
          completedRequests++;
          
          if (completedRequests === totalRequests) {
            expect(ids.size).toBe(totalRequests); // All IDs should be unique
            done();
          }
        },
        error: () => {
          completedRequests++;
          if (completedRequests === totalRequests) {
            done();
          }
        }
      });
    }
  });

  it('should return different afval type combinations', (done) => {
    const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
    const request: AfbeeldingUploadRequest = { afbeelding: mockBlob };
    const typeCombinations = new Set<string>();
    let completedRequests = 0;
    const totalRequests = 10;

    for (let i = 0; i < totalRequests; i++) {
      service.uploadEnHerkenAfbeelding(request).subscribe({
        next: (response) => {
          const typeIds = response.afvalTypes.map(t => t.id).sort().join(',');
          typeCombinations.add(typeIds);
          completedRequests++;
          
          if (completedRequests === totalRequests) {
            // Should have some variety in type combinations
            expect(typeCombinations.size).toBeGreaterThan(1);
            done();
          }
        },
        error: () => {
          completedRequests++;
          if (completedRequests === totalRequests) {
            done();
          }
        }
      });
    }
  });
});