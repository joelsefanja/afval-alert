import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ControleStapComponent } from './controle-stap.component';
import { MeldingsProcedureStatus } from '../../services/melding/melding-state.service';

describe('ControleStapComponent', () => {
  let component: ControleStapComponent;
  let fixture: ComponentFixture<ControleStapComponent>;
  let mockMeldingsProcedureStatus: jest.Mocked<MeldingsProcedureStatus>;

  const mockAfvalTypes = [
    { id: 'plastic', naam: 'Plastic fles', beschrijving: 'PET plastic', kleur: '#3B82F6', icoon: 'pi-circle' },
    { id: 'papier', naam: 'Papier', beschrijving: 'Karton', kleur: '#F59E0B', icoon: 'pi-file' }
  ];

  beforeEach(async () => {
    const spy = {
      gaTerugNaarVorige: jest.fn(),
      setHuidigeStap: jest.fn(),
      fotoUrl: signal('https://example.com/foto.jpg'),
      afvalTypes: signal(mockAfvalTypes),
      locatieAdres: signal('Grote Markt 1, 9712 HN Groningen'),
      locatieCoordinaten: signal({ lat: 53.2194, lng: 6.5665 }),
      contactInfo: signal({ email: 'test@example.com', naam: 'Jan Jansen', telefoon: '06-12345678' })
    } as unknown as jest.Mocked<MeldingsProcedureStatus>;

    await TestBed.configureTestingModule({
      imports: [ControleStapComponent],
      providers: [
        { provide: MeldingsProcedureStatus, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ControleStapComponent);
    component = fixture.componentInstance;
    mockMeldingsProcedureStatus = TestBed.inject(MeldingsProcedureStatus) as jest.Mocked<MeldingsProcedureStatus>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call gaTerugNaarVorige when terug is called', () => {
    component.terug();
    expect(mockMeldingsProcedureStatus.gaTerugNaarVorige).toHaveBeenCalled();
  });

  it('should navigate to verzend stap when verzendMelding is called', () => {
    component.verzendMelding();
    expect(mockMeldingsProcedureStatus.setHuidigeStap).toHaveBeenCalledWith(6);
  });

  it('should navigate to foto stap when wijzigFoto is called', () => {
    component.wijzigFoto();
    expect(mockMeldingsProcedureStatus.setHuidigeStap).toHaveBeenCalledWith(1);
  });

  it('should navigate to locatie stap when wijzigLocatie is called', () => {
    component.wijzigLocatie();
    expect(mockMeldingsProcedureStatus.setHuidigeStap).toHaveBeenCalledWith(3);
  });

  it('should navigate to contact stap when wijzigContact is called', () => {
    component.wijzigContact();
    expect(mockMeldingsProcedureStatus.setHuidigeStap).toHaveBeenCalledWith(4);
  });

  it('should display foto information', () => {
    fixture.detectChanges();
    
    const fotoImg = fixture.nativeElement.querySelector('img');
    expect(fotoImg).toBeTruthy();
    expect(fotoImg.src).toBe('https://example.com/foto.jpg');
  });

  it('should display afval types', () => {
    fixture.detectChanges();
    
    const afvalTypeElements = fixture.nativeElement.querySelectorAll('[data-testid="afval-type"]');
    expect(afvalTypeElements.length).toBe(2);
  });

  it('should display locatie information', () => {
    fixture.detectChanges();
    
    const locatieText = fixture.nativeElement.textContent;
    expect(locatieText).toContain('Grote Markt 1, 9712 HN Groningen');
    expect(locatieText).toContain('53.2194');
    expect(locatieText).toContain('6.5665');
  });

  it('should display contact information when available', () => {
    fixture.detectChanges();
    
    const contactText = fixture.nativeElement.textContent;
    expect(contactText).toContain('test@example.com');
    expect(contactText).toContain('Jan Jansen');
    expect(contactText).toContain('06-12345678');
  });

  it('should display anonymous message when no contact info', () => {
(mockMeldingsProcedureStatus.contactInfo as unknown as { set: (value: any) => void }).set({});
    fixture.detectChanges();
    
    const contactText = fixture.nativeElement.textContent;
    expect(contactText).toContain('Anonieme melding');
  });

  it('should have verzend button enabled', () => {
    fixture.detectChanges();
    
    const verzendButton = fixture.nativeElement.querySelector('[data-testid="verzend-button"]');
    expect(verzendButton).toBeTruthy();
    expect(verzendButton.disabled).toBeFalsy();
  });
});