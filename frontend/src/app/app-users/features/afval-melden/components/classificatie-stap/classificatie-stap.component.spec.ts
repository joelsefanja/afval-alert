import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { FotoVerwerkingComponent } from './classificatie-stap.component';
import { MeldingsProcedureStatus } from '../../services/melding/melding-state.service';
import { IAfvalHerkenningService, AFVAL_HERKENNING_SERVICE_TOKEN } from '../../interfaces/afval-herkenning.interface';
import { AfbeeldingUploadResponse } from '../../../../../models/afval-herkenning';

describe('FotoVerwerkingComponent', () => {
  let component: FotoVerwerkingComponent;
  let fixture: ComponentFixture<FotoVerwerkingComponent>;
  let mockMeldingsProcedureStatus: jest.Mocked<MeldingsProcedureStatus>;
  let mockAfvalHerkenningService: jest.Mocked<IAfvalHerkenningService>;

  const mockResponse: AfbeeldingUploadResponse = {
    meldingId: 'test-123',
    afvalTypes: [
      { id: 'plastic', naam: 'Plastic fles', beschrijving: 'PET plastic', kleur: '#3B82F6', icoon: 'pi-circle' }
    ],
    weetje: 'Test weetje over plastic'
  };

  beforeEach(async () => {
    const fotoUrlSignal = signal('data:image/jpeg;base64,test');
    const weetjeSignal = signal('');
    const afvalTypesSignal = signal([]);
    
    const meldingsSpy = {
      voltooiFotoVerwerking: jest.fn(),
      setHuidigeStap: jest.fn(),
      fotoUrl: fotoUrlSignal,
      weetje: weetjeSignal,
      afvalTypes: afvalTypesSignal
    } as unknown as jest.Mocked<MeldingsProcedureStatus>;

    const afvalHerkenningSpy = {
      uploadEnHerkenAfbeelding: jest.fn()
    } as unknown as jest.Mocked<IAfvalHerkenningService>;

    await TestBed.configureTestingModule({
      imports: [FotoVerwerkingComponent],
      providers: [
        { provide: MeldingsProcedureStatus, useValue: meldingsSpy },
        { provide: AFVAL_HERKENNING_SERVICE_TOKEN, useValue: afvalHerkenningSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FotoVerwerkingComponent);
    component = fixture.componentInstance;
    mockMeldingsProcedureStatus = TestBed.inject(MeldingsProcedureStatus) as jest.Mocked<MeldingsProcedureStatus>;
    mockAfvalHerkenningService = TestBed.inject(AFVAL_HERKENNING_SERVICE_TOKEN) as jest.Mocked<IAfvalHerkenningService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start foto verwerking on init', () => {
    mockAfvalHerkenningService.uploadEnHerkenAfbeelding.mockReturnValue(of(mockResponse));
    
    component.ngOnInit();
    
    expect(mockAfvalHerkenningService.uploadEnHerkenAfbeelding).toHaveBeenCalled();
  });

  it('should handle successful foto verwerking', (done) => {
    mockAfvalHerkenningService.uploadEnHerkenAfbeelding.mockReturnValue(of(mockResponse));
    
    component.ngOnInit();
    
    // Wacht op async verwerking
    setTimeout(() => {
      expect(component['verwerkingsFase']).toBe('voltooid');
      done();
    }, 100);
  });

  it('should handle foto verwerking error', (done) => {
    const error = new Error('AI service niet beschikbaar');
    mockAfvalHerkenningService.uploadEnHerkenAfbeelding.mockReturnValue(throwError(() => error));
    
    component.ngOnInit();
    
    // Wacht op async verwerking
    setTimeout(() => {
      expect(component['verwerkingsFase']).toBe('fout');
      expect(component['foutmelding']).toBe('AI service niet beschikbaar');
      done();
    }, 100);
  });

  it('should handle missing foto URL', () => {
    (mockMeldingsProcedureStatus.fotoUrl as any).set('');
    
    component.ngOnInit();
    
    expect(component['verwerkingsFase']).toBe('fout');
    expect(component['foutmelding']).toBe('Foto kon niet worden gelezen');
  });

  it('should retry foto verwerking', () => {
    mockAfvalHerkenningService.uploadEnHerkenAfbeelding.mockReturnValue(of(mockResponse));
    component['verwerkingsFase'] = 'fout';
    
    component.probeerOpnieuw();
    
    expect(component['verwerkingsFase']).toBe('uploaden');
    expect(component['foutmelding']).toBe('');
    expect(mockAfvalHerkenningService.uploadEnHerkenAfbeelding).toHaveBeenCalled();
  });

  it('should navigate back to foto step', () => {
    component.terugNaarFoto();
    
    expect(mockMeldingsProcedureStatus.setHuidigeStap).toHaveBeenCalledWith(1);
  });

  it('should cleanup subscription on destroy', () => {
    spyOn(component['subscription'], 'unsubscribe');
    
    component.ngOnDestroy();
    
    expect(component['subscription'].unsubscribe).toHaveBeenCalled();
  });
});