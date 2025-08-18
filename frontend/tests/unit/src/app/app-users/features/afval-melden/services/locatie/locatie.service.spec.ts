import { TestBed } from '@angular/core/testing';
import { LocatieService } from './locatie.service';
import { MeldingsProcedureStatus } from './melding-state.service';
import { Locatie } from '@app/models';

describe('LocatieService', () => {
  let service: LocatieService;
  let mockMeldingsProcedureStatus: jest.Mocked<MeldingsProcedureStatus>;

  beforeEach(() => {
    // Maak een mock voor de MeldingsProcedureStatus
    const mockStatus = {
      setLocatie: jest.fn(),
      setLocatieError: jest.fn()
    } as unknown as jest.Mocked<MeldingsProcedureStatus>;

    TestBed.configureTestingModule({
      providers: [
        LocatieService,
        { provide: MeldingsProcedureStatus, useValue: mockStatus }
      ]
    });

    service = TestBed.inject(LocatieService);
    mockMeldingsProcedureStatus = TestBed.inject(MeldingsProcedureStatus) as jest.Mocked<MeldingsProcedureStatus>;
  });

  it('moet correct geïnitialiseerd worden', () => {
    expect(service).toBeTruthy();
  });

  it('moet locatie correct verwerken', () => {
    // Maak een test locatie
    const testLocatie: Locatie = {
      adres: 'Grote Markt 1, Groningen',
      latitude: 53.2194,
      longitude: 6.5665
    };

    // Roep de verwerkLocatie methode aan
    service.verwerkLocatie(testLocatie);

    // Controleer of setLocatie is aangeroepen met de juiste parameters
    expect(mockMeldingsProcedureStatus.setLocatie).toHaveBeenCalledWith(
      'Grote Markt 1, Groningen',
      { lat: 53.2194, lng: 6.5665 }
    );
  });

  it('moet omgaan met locatie zonder adres', () => {
    // Maak een test locatie zonder adres
    const testLocatie: Locatie = {
      adres: '',
      latitude: 53.2194,
      longitude: 6.5665
    };

    // Roep de verwerkLocatie methode aan
    service.verwerkLocatie(testLocatie);

    // Controleer of setLocatie is aangeroepen met een leeg adres
    expect(mockMeldingsProcedureStatus.setLocatie).toHaveBeenCalledWith(
      '',
      { lat: 53.2194, lng: 6.5665 }
    );
  });
});