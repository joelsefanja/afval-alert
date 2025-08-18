import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { LocatieStapComponent } from '../../../../../../../src/app/app-users/features/afval-melden/components/locatie-stap/locatie-stap.component';
import { LocatieFacadeService, LocatieInfo } from '../../../../../../../src/app/app-users/features/afval-melden/services/locatie/locatie-facade.service';
import { MeldingsProcedureStatus } from '../../../../../../../src/app/app-users/features/afval-melden/services/melding/melding-state.service';
import { of } from 'rxjs';
import { signal } from '@angular/core';

describe('LocatieStapComponent', () => {
  let component: LocatieStapComponent;
  let fixture: ComponentFixture<LocatieStapComponent>;
  let mockLocatieFacade: jest.Mocked<LocatieFacadeService>;
  let mockMeldingsProcedureStatus: jest.Mocked<MeldingsProcedureStatus>;

  const mockLocatieInfo: LocatieInfo = {
    latitude: 52.3676,
    longitude: 4.9041,
    address: 'Dam 1, 1012 Amsterdam',
    wijk: 'Centrum',
    buurt: 'Burgwallen-Oude Zijde',
    gemeente: 'Amsterdam'
  };

  beforeEach(async () => {
    const locatieFacadeSpy = {
      locatieState: signal({
        isLoading: false,
        selectedAddress: '',
        errorMessage: '',
        canProceed: false
      }),
      setupSearchControl: jest.fn().mockReturnValue(of('')),
      getCurrentLocation: jest.fn(),
      searchAddress: jest.fn(),
      selectMapLocation: jest.fn(),
      getLastLocationInfo: jest.fn(),
      clearError: jest.fn(),
      destroy: jest.fn()
    } as unknown as jest.Mocked<LocatieFacadeService>;

    const meldingsSpy = {
      setLocatieAdres: jest.fn()
    } as unknown as jest.Mocked<MeldingsProcedureStatus>;

    await TestBed.configureTestingModule({
      imports: [LocatieStapComponent],
      providers: [
        { provide: LocatieFacadeService, useValue: locatieFacadeSpy },
        { provide: MeldingsProcedureStatus, useValue: meldingsSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LocatieStapComponent);
    component = fixture.componentInstance;
    mockLocatieFacade = TestBed.inject(LocatieFacadeService) as jest.Mocked<LocatieFacadeService>;
    mockMeldingsProcedureStatus = TestBed.inject(MeldingsProcedureStatus) as jest.Mocked<MeldingsProcedureStatus>;
  });

  describe('Component Creation', () => {
    it('should create component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with correct facade state', () => {
      expect(component['locatieState']).toBeDefined();
    });

    it('should initialize form control', () => {
      expect(component.zoekQuery).toBeInstanceOf(FormControl);
      expect(component.zoekQuery.value).toBe('');
    });
  });

  describe('Lifecycle', () => {
    it('should setup search control on init', () => {
      component.ngOnInit();
      
      expect(mockLocatieFacade.setupSearchControl).toHaveBeenCalledWith(component.zoekQuery);
    });

    it('should destroy facade on component destroy', () => {
      component.ngOnDestroy();
      
      expect(mockLocatieFacade.destroy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Template Getters', () => {
    it('should return correct values from facade state', () => {
      mockLocatieFacade.locatieState.selectedAddress = 'Test Address';
      mockLocatieFacade.locatieState.isLoading = true;
      mockLocatieFacade.locatieState.errorMessage = 'Test Error';
      mockLocatieFacade.locatieState.canProceed = true;

      expect(component.geselecteerdAdres).toBe('Test Address');
      expect(component.isLoading).toBe(true);
      expect(component.foutmelding).toBe('Test Error');
      expect(component.magDoorgaan).toBe(true);
    });

    it('should return loading state for template methods', () => {
      mockLocatieFacade.locatieState.isLoading = true;

      expect(component['gpsBezig']()).toBe(true);
      expect(component['adresZoekenBezig']()).toBe(true);
    });

    it('should return false for disabled state', () => {
      expect(component['disabled']()).toBe(false);
    });
  });

  describe('Location Actions', () => {
    it('should get current location through facade', async () => {
      mockLocatieFacade.getCurrentLocation.mockResolvedValue(mockLocatieInfo);

      await component['getCurrentLocation']();

      expect(mockLocatieFacade.getCurrentLocation).toHaveBeenCalledTimes(1);
    });

    it('should handle getCurrentLocation errors gracefully', async () => {
      mockLocatieFacade.getCurrentLocation.mockRejectedValue(new Error('GPS not available'));

      await expect(component['getCurrentLocation']()).resolves.not.toThrow();
    });

    it('should search address through facade', async () => {
      component.zoekQuery.setValue('Amsterdam');
      mockLocatieFacade.searchAddress.mockResolvedValue(mockLocatieInfo);

      await component['onAddressSearch']();

      expect(mockLocatieFacade.searchAddress).toHaveBeenCalledWith('Amsterdam');
    });

    it('should not search when query is empty', async () => {
      component.zoekQuery.setValue('');

      await component['onAddressSearch']();

      expect(mockLocatieFacade.searchAddress).not.toHaveBeenCalled();
    });

    it('should handle search errors gracefully', async () => {
      component.zoekQuery.setValue('Invalid Address');
      mockLocatieFacade.searchAddress.mockRejectedValue(new Error('Address not found'));

      await expect(component['onAddressSearch']()).resolves.not.toThrow();
    });

    it('should select map location through facade', async () => {
      mockLocatieFacade.selectMapLocation.mockResolvedValue(mockLocatieInfo);

      await component['onKaartLocatieGeselecteerd'](mockLocatieInfo);

      expect(mockLocatieFacade.selectMapLocation).toHaveBeenCalledWith(mockLocatieInfo);
    });

    it('should handle map location selection errors gracefully', async () => {
      mockLocatieFacade.selectMapLocation.mockRejectedValue(new Error('Invalid location'));

      await expect(component['onKaartLocatieGeselecteerd'](mockLocatieInfo)).resolves.not.toThrow();
    });
  });

  describe('Search Integration', () => {
    it('should set form control value and trigger search', () => {
      const searchSpy = jest.spyOn(component as any, 'onAddressSearch');
      
      component['zoekAdres']('Test Address');

      expect(component.zoekQuery.value).toBe('Test Address');
      expect(searchSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle search control setup with query filtering', () => {
      const mockObservable = of('long query string');
      mockLocatieFacade.setupSearchControl.mockReturnValue(mockObservable);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      component.ngOnInit();

      // Verify the subscription is set up correctly
      expect(mockLocatieFacade.setupSearchControl).toHaveBeenCalledWith(component.zoekQuery);
      
      // The observable should trigger console.log for queries longer than 3 characters
      mockObservable.subscribe();
      expect(consoleSpy).toHaveBeenCalledWith('Zoeken naar:', 'long query string');

      consoleSpy.mockRestore();
    });
  });
});