import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { SuccesStapComponent } from './succes-stap.component';
import { MeldingsProcedureStatus } from '../../services/melding/melding-state.service';

describe('SuccesStapComponent', () => {
  let component: SuccesStapComponent;
  let fixture: ComponentFixture<SuccesStapComponent>;
  let mockMeldingsProcedureStatus: jest.Mocked<MeldingsProcedureStatus>;

  beforeEach(async () => {
    const spy = {
      resetState: jest.fn(),
      contactInfo: signal({ email: 'test@example.com', naam: 'Jan Jansen' })
    } as unknown as jest.Mocked<MeldingsProcedureStatus>;

    await TestBed.configureTestingModule({
      imports: [SuccesStapComponent],
      providers: [
        { provide: MeldingsProcedureStatus, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SuccesStapComponent);
    component = fixture.componentInstance;
    mockMeldingsProcedureStatus = TestBed.inject(MeldingsProcedureStatus) as jest.Mocked<MeldingsProcedureStatus>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display success message', () => {
    fixture.detectChanges();
    
    const titleElement = fixture.nativeElement.querySelector('h1');
    expect(titleElement.textContent.trim()).toBe('Bedankt voor je melding!');
  });

  it('should display contact confirmation when email provided', () => {
    fixture.detectChanges();
    
    const contactText = fixture.nativeElement.textContent;
    expect(contactText).toContain('We houden je op de hoogte');
    expect(contactText).toContain('test@example.com');
  });

  it('should not display contact confirmation for anonymous', () => {
    Object.defineProperty(mockMeldingsProcedureStatus, 'contactInfo', { value: signal({}) });
    fixture.detectChanges();
    
    const contactText = fixture.nativeElement.textContent;
    expect(contactText).not.toContain('We houden je op de hoogte');
    expect(contactText).not.toContain('test@example.com');
  });

  it('should reset state when nieuweMelding is called', () => {
    component.nieuweMelding();
    
    expect(mockMeldingsProcedureStatus.resetState).toHaveBeenCalled();
  });

  it('should close window when sluitApp is called', () => {
    spyOn(window, 'close');
    
    component.sluitApp();
    
    expect(window.close).toHaveBeenCalled();
  });

  it('should display nieuwe melding button', () => {
    fixture.detectChanges();
    
    const nieuweMeldingButton = fixture.nativeElement.querySelector('[data-testid="nieuwe-melding-button"]');
    expect(nieuweMeldingButton).toBeTruthy();
    expect(nieuweMeldingButton.textContent.trim()).toContain('Nieuwe melding maken');
  });

  it('should display sluiten button', () => {
    fixture.detectChanges();
    
    const sluitenButton = fixture.nativeElement.querySelector('[data-testid="sluiten-button"]');
    expect(sluitenButton).toBeTruthy();
    expect(sluitenButton.textContent.trim()).toContain('Sluiten');
  });

  it('should display informational cards', () => {
    fixture.detectChanges();
    
    const infoText = fixture.nativeElement.textContent;
    expect(infoText).toContain('Wat gebeurt er nu?');
    expect(infoText).toContain('Goed voor het milieu');
    expect(infoText).toContain('3-7 werkdagen');
  });

  it('should display contact information', () => {
    fixture.detectChanges();
    
    const contactText = fixture.nativeElement.textContent;
    expect(contactText).toContain('14 050');
  });

  it('should have success icon', () => {
    fixture.detectChanges();
    
    const successIcon = fixture.nativeElement.querySelector('.pi-check');
    expect(successIcon).toBeTruthy();
  });

  it('should have proper styling classes', () => {
    fixture.detectChanges();
    
    const container = fixture.nativeElement.querySelector('.animate-fade-in');
    expect(container).toBeTruthy();
    
    const successCircle = fixture.nativeElement.querySelector('.animate-scale-in');
    expect(successCircle).toBeTruthy();
  });
});