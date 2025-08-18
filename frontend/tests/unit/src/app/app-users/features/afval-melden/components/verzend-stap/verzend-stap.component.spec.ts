import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { VerzendStapComponent } from './verzend-stap.component';
import { MeldingsProcedureStatus } from '../../services/melding/melding-state.service';
import { IMeldingService } from '../../interfaces/melding.interface';
import { MELDING_SERVICE_TOKEN } from '../../tokens/melding.token';
import { MeldingVerzendResponse } from '../../../../../models/afval-herkenning';
import { MeldingConcept, MeldingConceptStatus } from '../../../../../models/melding-concept';

describe('VerzendStapComponent', () => {
  let component: VerzendStapComponent;
  let fixture: ComponentFixture<VerzendStapComponent>;
  let mockMeldingsProcedureStatus: jest.Mocked<MeldingsProcedureStatus>;
  let mockMeldingService: jest.Mocked<IMeldingService>;

  const mockConcept: MeldingConcept = {
    id: 'test-123',
    afbeeldingUrl: 'https://example.com/foto.jpg',
    afvalTypes: [
      { id: 'plastic', naam: 'Plastic fles', beschrijving: 'PET plastic', kleur: '#3B82F6', icoon: 'pi-circle' }
    ],
    weetje: 'Test weetje',
    status: MeldingConceptStatus.KLAAR_VOOR_VERZENDEN,
    aanmaakDatum: new Date(),
    contact: { email: 'test@example.com' }
  };

  beforeEach(async () => {
    const meldingConceptSignal = signal(mockConcept);
    const locatieCoordinatenSignal = signal({ lat: 53.2194, lng: 6.5665 });
    const afvalTypesSignal = signal(mockConcept.afvalTypes);
    const locatieAdresSignal = signal('Grote Markt 1, Groningen');
    const contactInfoSignal = signal({ email: 'test@example.com' });
    
    const meldingsSpy = {
      setVerzenden: jest.fn(),
      setVerzendError: jest.fn(),
      setHuidigeStap: jest.fn(),
      meldingConcept: meldingConceptSignal,
      locatieCoordinaten: locatieCoordinatenSignal,
      afvalTypes: afvalTypesSignal,
      locatieAdres: locatieAdresSignal,
      contactInfo: contactInfoSignal
    } as unknown as jest.Mocked<MeldingsProcedureStatus>;

    const meldingServiceSpy = {
      verzendMelding: jest.fn()
    } as unknown as jest.Mocked<IMeldingService>;

    await TestBed.configureTestingModule({
      imports: [VerzendStapComponent],
      providers: [
        { provide: MeldingsProcedureStatus, useValue: meldingsSpy },
        { provide: MELDING_SERVICE_TOKEN, useValue: meldingServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VerzendStapComponent);
    component = fixture.componentInstance;
    mockMeldingsProcedureStatus = TestBed.inject(MeldingsProcedureStatus) as jest.Mocked<MeldingsProcedureStatus>;
    mockMeldingService = TestBed.inject(MELDING_SERVICE_TOKEN) as jest.Mocked<IMeldingService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start verzending on init', () => {
    const response: MeldingVerzendResponse = { success: true };
    mockMeldingService.verzendMelding.mockReturnValue(of(response));
    
    component.ngOnInit();
    
    expect(mockMeldingService.verzendMelding).toHaveBeenCalledWith({
      meldingId: 'test-123',
      locatie: { latitude: 53.2194, longitude: 6.5665 },
      contact: { email: 'test@example.com' }
    });
    expect(mockMeldingsProcedureStatus.setVerzenden).toHaveBeenCalledWith(true);
  });

  it('should handle successful verzending', (done) => {
    const response: MeldingVerzendResponse = { success: true };
    mockMeldingService.verzendMelding.mockReturnValue(of(response));
    
    component.ngOnInit();
    
    setTimeout(() => {
      expect(component['verzendStatus']).toBe('succes');
      expect(mockMeldingsProcedureStatus.setVerzenden).toHaveBeenCalledWith(false);
      done();
    }, 100);
  });

  it('should handle verzending error', (done) => {
    const error = new Error('Netwerk fout');
    mockMeldingService.verzendMelding.mockReturnValue(throwError(() => error));
    
    component.ngOnInit();
    
    setTimeout(() => {
      expect(component['verzendStatus']).toBe('fout');
      expect(component['foutmelding']).toBe('Netwerk fout');
      expect(mockMeldingsProcedureStatus.setVerzendError).toHaveBeenCalledWith('Netwerk fout');
      done();
    }, 100);
  });

  it('should handle missing concept', () => {
    (mockMeldingsProcedureStatus.meldingConcept as any).set(null);
    
    component.ngOnInit();
    
    expect(component['verzendStatus']).toBe('fout');
    expect(component['foutmelding']).toBe('Ontbrekende gegevens voor verzending');
  });

  it('should handle missing locatie', () => {
    (mockMeldingsProcedureStatus.locatieCoordinaten as any).set(null);
    
    component.ngOnInit();
    
    expect(component['verzendStatus']).toBe('fout');
    expect(component['foutmelding']).toBe('Ontbrekende gegevens voor verzending');
  });

  it('should retry verzending', () => {
    const response: MeldingVerzendResponse = { success: true };
    mockMeldingService.verzendMelding.mockReturnValue(of(response));
    component['verzendStatus'] = 'fout';
    
    component.probeerOpnieuw();
    
    expect(component['verzendStatus']).toBe('verzenden');
    expect(component['foutmelding']).toBe('');
    expect(mockMeldingService.verzendMelding).toHaveBeenCalled();
  });

  it('should navigate back to controle', () => {
    component.terugNaarControle();
    
    expect(mockMeldingsProcedureStatus.setHuidigeStap).toHaveBeenCalledWith(5);
  });

  it('should cleanup subscription on destroy', () => {
    spyOn(component['subscription'], 'unsubscribe');
    
    component.ngOnDestroy();
    
    expect(component['subscription'].unsubscribe).toHaveBeenCalled();
  });

  it('should display samenvatting during verzending', () => {
    mockMeldingService.verzendMelding.mockReturnValue(of({ success: true }));
    fixture.detectChanges();
    
    const samenvattingText = fixture.nativeElement.textContent;
    expect(samenvattingText).toContain('1 afvaltype(s) herkend');
    expect(samenvattingText).toContain('Grote Markt 1, Groningen');
    expect(samenvattingText).toContain('test@example.com');
  });

  it('should display anonymous message when no contact', () => {
    (mockMeldingsProcedureStatus.contactInfo as any).set({});
    mockMeldingService.verzendMelding.mockReturnValue(of({ success: true }));
    fixture.detectChanges();
    
    const samenvattingText = fixture.nativeElement.textContent;
    expect(samenvattingText).toContain('Anonieme melding');
  });
});