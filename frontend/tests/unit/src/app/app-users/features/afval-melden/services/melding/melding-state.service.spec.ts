import { TestBed } from '@angular/core/testing';
import { MeldingsProcedureStatus, AfvalMeldProcedureStap } from './melding-state.service';
import { MeldingMockService } from './melding-mock.service';
import { IMeldingService } from '../interfaces/melding.interface';
import { of } from 'rxjs';

// Mock voor de MeldingMockService
class MockMeldingService implements IMeldingService {
  slaaMeldingConceptOp = jest.fn().mockReturnValue(of({}));
  haalMeldingConceptOp = jest.fn().mockReturnValue(of(null));
  getMeldingConcept = jest.fn().mockReturnValue(of(null));
  verzendMelding = jest.fn().mockReturnValue(of({}));
  verwijderMeldingConcept = jest.fn().mockReturnValue(of({}));
}

describe('MeldingsProcedureStatus', () => {
  let service: MeldingsProcedureStatus;
  let mockMeldingService: MockMeldingService;

  beforeEach(() => {
    mockMeldingService = new MockMeldingService();

    TestBed.configureTestingModule({
      providers: [
        MeldingsProcedureStatus,
        { provide: MeldingMockService, useValue: mockMeldingService }
      ]
    });

    service = TestBed.inject(MeldingsProcedureStatus);
  });

  it('moet correct geïnitialiseerd worden', () => {
    expect(service).toBeTruthy();
    expect(service.huidigeStap()).toBe(AfvalMeldProcedureStap.START);
    expect(service.meldingConcept()).toBeNull();
    expect(service.fotoUrl()).toBe('');
    expect(service.fotoError()).toBe('');
    expect(service.verwerkingActief()).toBe(false);
    expect(service.isOffline()).toBe(false);
    expect(service.isVerzenden()).toBe(false);
  });

  it('moet naar de volgende stap gaan', () => {
    // Start op START stap
    expect(service.huidigeStap()).toBe(AfvalMeldProcedureStap.START);
    
    // Ga naar volgende stap (FOTO)
    service.gaNaarVolgende();
    expect(service.huidigeStap()).toBe(AfvalMeldProcedureStap.FOTO);
    
    // Ga naar volgende stap (FOTO_VERWERKING)
    service.gaNaarVolgende();
    expect(service.huidigeStap()).toBe(AfvalMeldProcedureStap.FOTO_VERWERKING);
  });

  it('moet terug kunnen gaan naar de vorige stap', () => {
    // Zet huidige stap op LOCATIE
    service.setHuidigeStap(AfvalMeldProcedureStap.LOCATIE);
    expect(service.huidigeStap()).toBe(AfvalMeldProcedureStap.LOCATIE);
    
    // Ga terug naar vorige stap (FOTO, slaat FOTO_VERWERKING over)
    service.gaTerugNaarVorige();
    expect(service.huidigeStap()).toBe(AfvalMeldProcedureStap.FOTO);
    
    // Ga terug naar vorige stap (START)
    service.gaTerugNaarVorige();
    expect(service.huidigeStap()).toBe(AfvalMeldProcedureStap.START);
    
    // Probeer terug te gaan vanaf START (moet op START blijven)
    service.gaTerugNaarVorige();
    expect(service.huidigeStap()).toBe(AfvalMeldProcedureStap.START);
  });

  it('moet foto URL kunnen instellen', () => {
    const testUrl = 'test-foto-url.jpg';
    service.setFotoUrl(testUrl);
    expect(service.fotoUrl()).toBe(testUrl);
  });

  it('moet offline status kunnen instellen', () => {
    expect(service.isOffline()).toBe(false);
    service.setOfflineStatus(true);
    expect(service.isOffline()).toBe(true);
  });

  it('moet state kunnen resetten', () => {
    // Stel eerst wat waarden in
    service.setHuidigeStap(AfvalMeldProcedureStap.LOCATIE);
    service.setFotoUrl('test.jpg');
    service.setOfflineStatus(true);
    
    // Reset de state
    service.resetState();
    
    // Controleer of alles is gereset
    expect(service.huidigeStap()).toBe(AfvalMeldProcedureStap.START);
    expect(service.meldingConcept()).toBeNull();
    expect(service.fotoUrl()).toBe('');
    expect(service.fotoError()).toBe('');
    expect(service.verwerkingActief()).toBe(false);
    expect(service.isOffline()).toBe(false);
    expect(service.isVerzenden()).toBe(false);
  });
});