import { TestBed } from '@angular/core/testing';
import { SessieStorageService } from './sessie-storage.service';
import { MeldingConcept, MeldingConceptStatus } from '../../../../models/melding-concept';

describe('SessieStorageService', () => {
  let service: SessieStorageService;
  let mockSessionStorage: { [key: string]: string };

  const mockConcept: MeldingConcept = {
    id: 'test-123',
    afbeeldingUrl: 'https://example.com/foto.jpg',
    afvalTypes: [
      { id: 'plastic', naam: 'Plastic fles', beschrijving: 'PET plastic', kleur: '#3B82F6', icoon: 'pi-circle' }
    ],
    weetje: 'Test weetje',
    status: MeldingConceptStatus.AFBEELDING_VERWERKT,
    aanmaakDatum: new Date('2024-01-01T12:00:00Z')
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessieStorageService);

    // Mock sessionStorage
    mockSessionStorage = {};
    jest.spyOn(sessionStorage, 'getItem').mockImplementation((key: string) => mockSessionStorage[key] || null);
    jest.spyOn(sessionStorage, 'setItem').mockImplementation((key: string, value: string) => {
      mockSessionStorage[key] = value;
    });
    jest.spyOn(sessionStorage, 'removeItem').mockImplementation((key: string) => {
      delete mockSessionStorage[key];
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should save melding concept successfully', (done) => {
    service.slaaMeldingConceptOp(mockConcept).subscribe({
      next: (success) => {
        expect(success).toBe(true);
        expect(sessionStorage.setItem).toHaveBeenCalled();
        done();
      }
    });
  });

  it('should retrieve saved melding concept', (done) => {
    // First save the concept
    service.slaaMeldingConceptOp(mockConcept).subscribe(() => {
      // Then retrieve it
      service.getMeldingConcept('test-123').subscribe({
        next: (concept) => {
          expect(concept).toBeDefined();
          expect(concept!.id).toBe('test-123');
          expect(concept!.afbeeldingUrl).toBe('https://example.com/foto.jpg');
          expect(concept!.afvalTypes.length).toBe(1);
          expect(concept!.weetje).toBe('Test weetje');
          expect(concept!.status).toBe(MeldingConceptStatus.AFBEELDING_VERWERKT);
          expect(concept!.aanmaakDatum).toBeInstanceOf(Date);
          done();
        }
      });
    });
  });

  it('should return null for non-existent concept', (done) => {
    service.getMeldingConcept('non-existent').subscribe({
      next: (concept) => {
        expect(concept).toBeNull();
        done();
      }
    });
  });

  it('should update existing concept', (done) => {
    // Save initial concept
    service.slaaMeldingConceptOp(mockConcept).subscribe(() => {
      // Update the concept
      const updatedConcept = { 
        ...mockConcept, 
        weetje: 'Updated weetje',
        status: MeldingConceptStatus.LOCATIE_TOEGEVOEGD
      };
      
      service.slaaMeldingConceptOp(updatedConcept).subscribe(() => {
        // Retrieve and verify update
        service.getMeldingConcept('test-123').subscribe({
          next: (concept) => {
            expect(concept!.weetje).toBe('Updated weetje');
            expect(concept!.status).toBe(MeldingConceptStatus.LOCATIE_TOEGEVOEGD);
            done();
          }
        });
      });
    });
  });

  it('should delete melding concept', (done) => {
    // Save concept first
    service.slaaMeldingConceptOp(mockConcept).subscribe(() => {
      // Delete it
      service.verwijderMeldingConcept('test-123').subscribe(() => {
        // Verify it's gone
        service.getMeldingConcept('test-123').subscribe({
          next: (concept) => {
            expect(concept).toBeNull();
            done();
          }
        });
      });
    });
  });

  it('should handle multiple concepts', (done) => {
    const concept2: MeldingConcept = {
      ...mockConcept,
      id: 'test-456',
      weetje: 'Second weetje'
    };

    // Save both concepts
    service.slaaMeldingConceptOp(mockConcept).subscribe(() => {
      service.slaaMeldingConceptOp(concept2).subscribe(() => {
        // Retrieve all concepts
        service.getAlleMeldingConcepten().subscribe({
          next: (concepts) => {
            expect(concepts.length).toBe(2);
            expect(concepts.find(c => c.id === 'test-123')).toBeDefined();
            expect(concepts.find(c => c.id === 'test-456')).toBeDefined();
            done();
          }
        });
      });
    });
  });

  it('should clean up old concepts', (done) => {
    const oldConcept: MeldingConcept = {
      ...mockConcept,
      id: 'old-concept',
      aanmaakDatum: new Date(Date.now() - 25 * 60 * 60 * 1000) // 25 hours ago
    };

    const newConcept: MeldingConcept = {
      ...mockConcept,
      id: 'new-concept',
      aanmaakDatum: new Date() // Now
    };

    // Save both concepts
    service.slaaMeldingConceptOp(oldConcept).subscribe(() => {
      service.slaaMeldingConceptOp(newConcept).subscribe(() => {
        // Clean up old concepts
        service.ruimOudeConceptenOp().subscribe({
          next: (aantalVerwijderd) => {
            expect(aantalVerwijderd).toBe(1);
            
            // Verify only new concept remains
            service.getAlleMeldingConcepten().subscribe({
              next: (concepts) => {
                expect(concepts.length).toBe(1);
                expect(concepts[0].id).toBe('new-concept');
                done();
              }
            });
          }
        });
      });
    });
  });

  it('should handle storage errors gracefully', (done) => {
    // Mock storage error
    (sessionStorage.setItem as jest.MockedFunction<typeof sessionStorage.setItem>).mockImplementation(() => {
      throw new Error('Storage full');
    });

    service.slaaMeldingConceptOp(mockConcept).subscribe({
      next: () => {
        fail('Should have thrown error');
        done();
      },
      error: (error) => {
        expect(error.message).toContain('opslaan');
        done();
      }
    });
  });

  it('should handle corrupted storage data', (done) => {
    // Set corrupted data
    mockSessionStorage['afval-melding-concepten'] = 'invalid json';

    service.getMeldingConcept('test-123').subscribe({
      next: (concept) => {
        expect(concept).toBeNull();
        done();
      }
    });
  });

  it('should handle empty storage', (done) => {
    service.getAlleMeldingConcepten().subscribe({
      next: (concepts) => {
        expect(concepts).toEqual([]);
        done();
      }
    });
  });

  it('should preserve concept properties correctly', (done) => {
    const complexConcept: MeldingConcept = {
      ...mockConcept,
      locatie: {
        latitude: 53.2194,
        longitude: 6.5665,
        adres: 'Test adres'
      },
      contact: {
        email: 'test@example.com',
        naam: 'Test User',
        telefoon: '06-12345678'
      }
    };

    service.slaaMeldingConceptOp(complexConcept).subscribe(() => {
      service.getMeldingConcept(complexConcept.id).subscribe({
        next: (concept) => {
          expect(concept!.locatie).toBeDefined();
          expect(concept!.locatie!.latitude).toBe(53.2194);
          expect(concept!.locatie!.longitude).toBe(6.5665);
          expect(concept!.locatie!.adres).toBe('Test adres');
          expect(concept!.contact).toBeDefined();
          expect(concept!.contact!.email).toBe('test@example.com');
          expect(concept!.contact!.naam).toBe('Test User');
          expect(concept!.contact!.telefoon).toBe('06-12345678');
          done();
        }
      });
    });
  });
});