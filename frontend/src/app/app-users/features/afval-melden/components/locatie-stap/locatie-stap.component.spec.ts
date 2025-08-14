import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { LocatieStapComponent } from './locatie-stap.component';
import { MeldingsProcedureStatus } from '../../services/melding/melding-state.service';
import { LocatieService } from '../../services/locatie.service';

describe('LocatieStapComponent', () => {
  let component: LocatieStapComponent;
  let fixture: ComponentFixture<LocatieStapComponent>;
  let mockMeldingsProcedureStatus: jest.Mocked<MeldingsProcedureStatus>;
  let mockLocatieService: jest.Mocked<LocatieService>;

  beforeEach(async () => {
    const meldingsSpy = {
      gaTerugNaarVorige: jest.fn(),
      gaNaarVolgende: jest.fn(),
      setLocatie: jest.fn(),
      setLocatieError: jest.fn(),
      locatieAdres: signal(''),
      locatieError: signal('')
    } as unknown as jest.Mocked<MeldingsProcedureStatus>;

    const locatieSpy = {
      getCurrentPosition: jest.fn(),
      getAddressFromCoordinates: jest.fn(),
      getCoordinatesFromAddress: jest.fn()
    } as unknown as jest.Mocked<LocatieService>;

    await TestBed.configureTestingModule({
      imports: [LocatieStapComponent],
      providers: [
        { provide: MeldingsProcedureStatus, useValue: meldingsSpy },
        { provide: LocatieService, useValue: locatieSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LocatieStapComponent);
    component = fixture.componentInstance;
    mockMeldingsProcedureStatus = TestBed.inject(MeldingsProcedureStatus) as jest.Mocked<MeldingsProcedureStatus>;
    mockLocatieService = TestBed.inject(LocatieService) as jest.Mocked<LocatieService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call gaTerugNaarVorige when terug is called', () => {
    component.terug();
    expect(mockMeldingsProcedureStatus.gaTerugNaarVorige).toHaveBeenCalled();
  });

  it('should call gaNaarVolgende when volgende is called', () => {
    component.volgende();
    expect(mockMeldingsProcedureStatus.gaNaarVolgende).toHaveBeenCalled();
  });

  it('should get current location', async () => {
    const mockPosition = {
      coords: { latitude: 53.2194, longitude: 6.5665 }
    } as GeolocationPosition;
    
    mockLocatieService.getCurrentPosition.mockResolvedValue(mockPosition);
    mockLocatieService.getAddressFromCoordinates.mockResolvedValue('Test Adres 123');

    await component.getCurrentLocation();

    expect(mockLocatieService.getCurrentPosition).toHaveBeenCalled();
    expect(mockLocatieService.getAddressFromCoordinates).toHaveBeenCalledWith(53.2194, 6.5665);
    expect(mockMeldingsProcedureStatus.setLocatie).toHaveBeenCalledWith(
      'Test Adres 123',
      { lat: 53.2194, lng: 6.5665 },
      false
    );
  });

  it('should handle location error', async () => {
    mockLocatieService.getCurrentPosition.mockRejectedValue(new Error('Location not available'));

    await component.getCurrentLocation();

    expect(mockMeldingsProcedureStatus.setLocatieError).toHaveBeenCalledWith('Locatie kon niet worden bepaald');
  });
});