import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { FotoStapComponent } from './foto-stap.component';
import { MeldingsProcedureStatus } from '../../services/melding/melding-state.service';
import { FotoService } from '../../services/foto.service';
// Import van test-helpers voor JestSpy type
import { toegankelijkVoorTests, maakMediaDevicesSpy, maakOutputEventSpy } from '../../test/test-helpers';

describe('FotoStapComponent', () => {
  // Component en mocks declareren
  let component: FotoStapComponent;
  let fixture: ComponentFixture<FotoStapComponent>;
  let mockMeldingsProcedureStatus: jest.Mocked<MeldingsProcedureStatus>;
  let mockFotoService: jest.Mocked<FotoService>;

  // Setup voor alle tests
  beforeEach(async () => {
    // Mock services aanmaken
    const meldingsSpy = {
      gaTerugNaarVorige: jest.fn(),
      gaNaarVolgende: jest.fn(),
      setFotoUrl: jest.fn(),
      setFotoError: jest.fn(),
      fotoUrl: signal(''),
      fotoError: signal('')
    } as unknown as jest.Mocked<MeldingsProcedureStatus>;

    const fotoSpy = {
      kiesFotoUitGalerij: jest.fn(),
      blobToDataUrl: jest.fn()
    } as unknown as jest.Mocked<FotoService>;

    // TestBed configureren
    await TestBed.configureTestingModule({
      imports: [FotoStapComponent],
      providers: [
        { provide: MeldingsProcedureStatus, useValue: meldingsSpy },
        { provide: FotoService, useValue: fotoSpy }
      ]
    }).compileComponents();

    // Component en mocks instellen
    fixture = TestBed.createComponent(FotoStapComponent);
    component = fixture.componentInstance;
    mockMeldingsProcedureStatus = TestBed.inject(MeldingsProcedureStatus) as jest.Mocked<MeldingsProcedureStatus>;
    mockFotoService = TestBed.inject(FotoService) as jest.Mocked<FotoService>;
  });

  // Basis tests voor component en navigatie functies
  describe('Basis functionaliteit', () => {
    it('moet component aanmaken', () => {
      expect(component).toBeTruthy();
    });

    // Test navigatie functies
    describe('Navigatie', () => {
      it('moet terug functie aanroepen', () => {
        // Gebruik de helper functie voor output event spy
        const navigatieTerugSpy = maakOutputEventSpy(component, 'navigatieTerug');
        
        // Roep de protected methode aan via helper functie
        toegankelijkVoorTests(component).terug();
        
        // Verificatie
        expect(mockMeldingsProcedureStatus.gaTerugNaarVorige).toHaveBeenCalledTimes(1);
        expect(navigatieTerugSpy).toHaveBeenCalled();
      });
      
      it('moet volgende functie aanroepen', () => {
        // Gebruik de helper functie voor output event spy
        const navigatieVolgendeSpy = maakOutputEventSpy(component, 'navigatieVolgende');
        
        // Roep de protected methode aan via helper functie
        toegankelijkVoorTests(component).volgende();
        
        // Verificatie
        expect(mockMeldingsProcedureStatus.gaNaarVolgende).toHaveBeenCalledTimes(1);
        expect(navigatieVolgendeSpy).toHaveBeenCalled();
      });
    });

    it('moet foto resetten bij annuleren', () => {
      // Gebruik helper functie om toegang te krijgen tot protected methode
      toegankelijkVoorTests(component).annuleerFoto();
      expect(mockMeldingsProcedureStatus.setFotoUrl).toHaveBeenCalledWith('');
      expect(mockMeldingsProcedureStatus.setFotoError).toHaveBeenCalledWith('');
    });
  });

  // Camera functionaliteit tests
  describe('Camera functionaliteit', () => {
    let mockMediaDevices: ReturnType<typeof jest.spyOn>;
    
    afterEach(() => {
      // Cleanup na elke test
      mockMediaDevices?.mockRestore();
    });
    
    it('moet camera starten', async () => {
      // Mock getUserMedia voor succesvolle camera start met helper functie
      const mockStream = {} as MediaStream;
      mockMediaDevices = maakMediaDevicesSpy(Promise.resolve(mockStream));

      // Test camera starten met helper functie
      await toegankelijkVoorTests(component).startCamera();
      
      // Verificatie
      expect(mockMediaDevices).toHaveBeenCalled();
      expect(toegankelijkVoorTests(component).cameraActive()).toBe(true);
      expect(toegankelijkVoorTests(component).stream()).toBe(mockStream);
    });

    it('moet camera fouten afhandelen', async () => {
      // Mock getUserMedia voor foutafhandeling met helper functie
      mockMediaDevices = maakMediaDevicesSpy(Promise.reject(new Error('Camera not available')));

      // Test foutafhandeling met helper functie
      await toegankelijkVoorTests(component).startCamera();
      
      // Verificatie
      expect(mockMediaDevices).toHaveBeenCalled();
      expect(mockMeldingsProcedureStatus.setFotoError).toHaveBeenCalledWith('Camera niet beschikbaar. Controleer je browser instellingen.');
      expect(toegankelijkVoorTests(component).cameraActive()).toBe(false);
    });
  });
});