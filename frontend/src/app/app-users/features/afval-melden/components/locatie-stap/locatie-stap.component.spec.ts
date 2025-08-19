import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { LocatieStapComponent } from './locatie-stap.component';
import { MeldingsProcedureStatus } from '../../services/melding/melding-state.service';
import { LocatieService } from '../../services/locatie/locatie.service';
import { LocatieConfigService } from '../../../../../services/locatie-config.service';

describe('LocatieStapComponent', () => {
  // Component en mocks declareren
  let component: LocatieStapComponent;
  let fixture: ComponentFixture<LocatieStapComponent>;
  let mockMeldingsProcedureStatus: jest.Mocked<MeldingsProcedureStatus>;
  let mockLocatieService: jest.Mocked<LocatieService>;
    let mockLocatieConfigService: jest.Mocked<LocatieConfigService>;

  // Setup voor alle tests
  beforeEach(async () => {
    // Mock services aanmaken
    const meldingsSpy = {
      gaTerugNaarVorige: jest.fn(),
      gaNaarVolgende: jest.fn(),
      locatieError: signal(''),
      locatieAdres: signal('')
    } as unknown as jest.Mocked<MeldingsProcedureStatus>;

    const locatieSpy = {
      getCurrentPosition: jest.fn(),
      getAddressFromCoordinates: jest.fn(),
      getCoordinatesFromAddress: jest.fn(),
      valideerLocatie: jest.fn()
    } as unknown as jest.Mocked<LocatieService>;
    const locatieConfigSpy = {
      loadConfig: jest.fn()
    } as unknown as jest.Mocked<LocatieConfigService>;

    // TestBed configureren
    await TestBed.configureTestingModule({
      imports: [LocatieStapComponent],
      providers: [
        { provide: MeldingsProcedureStatus, useValue: meldingsSpy },
        { provide: LocatieService, useValue: locatieSpy },
        { provide: LocatieConfigService, useValue: locatieConfigSpy }
      ]
    }).compileComponents();

    // Component en mocks instellen
    fixture = TestBed.createComponent(LocatieStapComponent);
    component = fixture.componentInstance;
    mockMeldingsProcedureStatus = TestBed.inject(MeldingsProcedureStatus) as jest.Mocked<MeldingsProcedureStatus>;
    mockLocatieService = TestBed.inject(LocatieService) as jest.Mocked<LocatieService>;
    mockLocatieConfigService = TestBed.inject(LocatieConfigService) as jest.Mocked<LocatieConfigService>;
  });

  // Basis tests voor component en navigatie functies
  describe('Basis functionaliteit', () => {
    it('moet component aanmaken', () => {
      expect(component).toBeTruthy();
    });

    // Test navigatie functies
    describe('Navigatie', () => {
      it('moet terug functie aanroepen', () => {
        // Roep de protected methode aan
        (component as any).terug();
        
        // Verificatie
        expect(mockMeldingsProcedureStatus.gaTerugNaarVorige).toHaveBeenCalledTimes(1);
      });
      
      it('moet volgende functie aanroepen', () => {
        // Roep de protected methode aan
        (component as any).volgende();
        
        // Verificatie
        expect(mockMeldingsProcedureStatus.gaNaarVolgende).toHaveBeenCalledTimes(1);
      });
    });
  });

  // Locatie functionaliteit tests
  describe('Locatie functionaliteit', () => {
    it('moet huidige locatie ophalen', async () => {
      // Mock de locatie service
      const mockPosition = {
        coords: {
          latitude: 53.2193835,
          longitude: 6.5665017
        }
      } as any;
      
      mockLocatieService.getCurrentPosition.mockResolvedValue(mockPosition.coords);
      mockLocatieService.getAddressFromCoordinates.mockResolvedValue({} as any);
      mockLocatieService.valideerLocatie.mockResolvedValue(true);
      
      // Test huidige locatie ophalen
      await (component as any).getCurrentLocation();
      
      // Verificatie
      expect(mockLocatieService.getCurrentPosition).toHaveBeenCalled();
      expect(mockLocatieService.getAddressFromCoordinates).toHaveBeenCalledWith(53.2193835, 6.5665017);
      expect(mockLocatieService.valideerLocatie).toHaveBeenCalledWith(53.2193835, 6.5665017);
    });

    it('moet fouten bij locatie ophalen afhandelen', async () => {
      // Mock de locatie service om een fout te gooien
      mockLocatieService.getCurrentPosition.mockRejectedValue(new Error('Locatie niet beschikbaar'));
      
      // Test foutafhandeling
      await (component as any).getCurrentLocation();
      
      
      // Verificatie
      expect(mockLocatieService.getCurrentPosition).toHaveBeenCalled();
      expect(component.foutmelding).toBe('Er is een fout opgetreden bij het ophalen van uw locatie');
    });
    it('moet adres zoeken', async () => {
      // Mock de component state
      (component as any).zoekQuery.setValue('Groningen');
      
      // Mock de locatie service
      mockLocatieService.getCoordinatesFromAddress.mockResolvedValue({ lat: 53.2193835, lng: 6.5665017 });
      mockLocatieService.valideerLocatie.mockResolvedValue(true);
      
      // Test adres zoeken
      await (component as any).onAddressSearch();
      
      // Verificatie
      expect(mockLocatieService.getCoordinatesFromAddress).toHaveBeenCalledWith('Groningen');
      expect(mockLocatieService.valideerLocatie).toHaveBeenCalledWith(53.2193835, 6.5665017);
    });

    it('moet locatie selectie van kaart verwerken', async () => {
      // Mock de locatie info
      const mockLocatieInfo = {
        latitude: 53.2193835,
        longitude: 6.5665017,
        address: 'Groningen'
      };
      
      // Mock de locatie service
      mockLocatieService.valideerLocatie.mockResolvedValue(true);
      
      // Mock de geocoding service
      const mockAddressData = {
        straat: 'Teststraat',
        huisnummer: '1',
        postcode: '1234AB',
        plaats: 'Groningen'
      };
      
      // Test locatie selectie verwerken
      await (component as any).onKaartLocatieGeselecteerd(mockLocatieInfo);
      
      // Verificatie
      expect(mockLocatieService.valideerLocatie).toHaveBeenCalledWith(53.2193835, 6.5665017);
    });
  });
});