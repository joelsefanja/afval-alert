import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ContactStapComponent } from './contact-stap.component';
import { MeldingsProcedureStatus } from '../../services/melding/melding-state.service';

describe('ContactStapComponent', () => {
  let component: ContactStapComponent;
  let fixture: ComponentFixture<ContactStapComponent>;
  let mockMeldingsProcedureStatus: jest.Mocked<MeldingsProcedureStatus>;

  beforeEach(async () => {
    const spy = {
      gaTerugNaarVorige: jest.fn(),
      gaNaarVolgende: jest.fn(),
      setContactInfo: jest.fn(),
      emailError: signal('')
    } as unknown as jest.Mocked<MeldingsProcedureStatus>;

    await TestBed.configureTestingModule({
      imports: [ContactStapComponent],
      providers: [
        { provide: MeldingsProcedureStatus, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactStapComponent);
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

  it('should validate form correctly for anonymous submission', () => {
    component.anoniem = true;
    expect(component.isFormValid()).toBe(true);
  });

  it('should validate form correctly with valid email', () => {
    component.anoniem = false;
    component.email = 'test@example.com';
    expect(component.isFormValid()).toBe(true);
  });

  it('should invalidate form with invalid email', () => {
    component.anoniem = false;
    component.email = 'invalid-email';
    expect(component.isFormValid()).toBe(false);
  });

  it('should clear fields when switching to anonymous', () => {
    component.email = 'test@example.com';
    component.naam = 'Test User';
    component.telefoon = '0612345678';
    
    component.anoniem = true;
    component.onAniemChange();
    
    expect(component.email).toBe('');
    expect(component.naam).toBe('');
    expect(component.telefoon).toBe('');
  });

  it('should set contact info when proceeding', () => {
    component.anoniem = false;
    component.email = 'test@example.com';
    component.naam = 'Test User';
    
    component.volgende();
    
    expect(mockMeldingsProcedureStatus.setContactInfo).toHaveBeenCalledWith({
      email: 'test@example.com',
      naam: 'Test User',
      telefoon: ''
    });
    expect(mockMeldingsProcedureStatus.gaNaarVolgende).toHaveBeenCalled();
  });
});