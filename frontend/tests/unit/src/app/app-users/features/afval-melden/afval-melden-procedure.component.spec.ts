import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AfvalMeldenProcedureComponent } from './afval-melden-procedure.component';
import { MeldingsProcedureStatus, AfvalMeldProcedureStap } from './services/melding/melding-state.service';
import { NetworkService } from './services/core/network.service';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { Component, Input } from '@angular/core';
import { Stap } from './afval-melden-procedure.component';

// Mock componenten
@Component({ selector: 'ui-header', template: '' })
class MockHeaderComponent {}

@Component({ selector: 'ui-start-stap', template: '' })
class MockStartStapComponent {}

@Component({ selector: 'ui-foto-stap', template: '' })
class MockFotoStapComponent {}

@Component({ selector: 'ui-locatie-stap', template: '' })
class MockLocatieStapComponent {}

@Component({ selector: 'ui-contact-stap', template: '' })
class MockContactStapComponent {}

@Component({ selector: 'ui-controle-stap', template: '' })
class MockControleStapComponent {}

@Component({ selector: 'ui-succes-stap', template: '' })
class MockSuccesStapComponent {}

@Component({ selector: 'ui-offline-notificatie', template: '' })
class MockOfflineNotificatieComponent {}

@Component({ selector: 'ui-stappen-indicator', template: '' })
class MockStappenIndicatorComponent {
  @Input() stappen: Stap[] = [];
}

@Component({ selector: 'ui-voortgangs-balk', template: '' })
class MockVoortgangsBalkComponent {
  @Input() huidigeStap = 0;
  @Input() totaalAantalStappen = 0;
}

@Component({ selector: 'ui-terug-knop', template: '' })
class MockTerugKnopComponent {}

// Mock services
class MockMeldingsProcedureStatus {
  huidigeStap = jest.fn().mockReturnValue(AfvalMeldProcedureStap.START);
  isOffline = jest.fn().mockReturnValue(false);
  heeftVorigeStap = jest.fn().mockReturnValue(false);
  resetState = jest.fn();
  setOfflineStatus = jest.fn();
}

class MockNetworkService {
  isOnline$ = of(true);
}

describe('AfvalMeldenProcedureComponent', () => {
  let component: AfvalMeldenProcedureComponent;
  let fixture: ComponentFixture<AfvalMeldenProcedureComponent>;
  let mockState: MockMeldingsProcedureStatus;

  beforeEach(async () => {
    mockState = new MockMeldingsProcedureStatus();

    await TestBed.configureTestingModule({
      declarations: [
        AfvalMeldenProcedureComponent,
        MockHeaderComponent,
        MockStartStapComponent,
        MockFotoStapComponent,
        MockLocatieStapComponent,
        MockContactStapComponent,
        MockControleStapComponent,
        MockSuccesStapComponent,
        MockOfflineNotificatieComponent,
        MockStappenIndicatorComponent,
        MockVoortgangsBalkComponent,
        MockTerugKnopComponent
      ],
      imports: [CommonModule],
      providers: [
        { provide: MeldingsProcedureStatus, useValue: mockState },
        { provide: NetworkService, useClass: MockNetworkService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AfvalMeldenProcedureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('moet correct initialiseren', () => {
    expect(component).toBeTruthy();
    expect(mockState.resetState).toHaveBeenCalled();
  });

  it('moet stappenData correct berekenen voor START stap', () => {
    mockState.huidigeStap.mockReturnValue(AfvalMeldProcedureStap.START);
    fixture.detectChanges();
    
    // Bij START stap moet stappenData leeg zijn
    expect(component.stappenData()).toEqual([]);
  });

  it('moet stappenData correct berekenen voor FOTO stap', () => {
    mockState.huidigeStap.mockReturnValue(AfvalMeldProcedureStap.FOTO);
    mockState.heeftVorigeStap.mockReturnValue(true);
    fixture.detectChanges();
    
    const stappenData = component.stappenData();
    expect(stappenData.length).toBe(4); // 4 stappen in totaal
    
    // Controleer of de eerste stap actief is
    expect(stappenData[0].actief).toBe(true);
    expect(stappenData[0].voltooid).toBe(false);
    
    // Controleer of de andere stappen niet actief of voltooid zijn
    expect(stappenData[1].actief).toBe(false);
    expect(stappenData[1].voltooid).toBe(false);
  });

  it('moet stappenData correct berekenen voor LOCATIE stap', () => {
    mockState.huidigeStap.mockReturnValue(AfvalMeldProcedureStap.LOCATIE);
    mockState.heeftVorigeStap.mockReturnValue(true);
    fixture.detectChanges();
    
    const stappenData = component.stappenData();
    
    // Controleer of de eerste stap voltooid is
    expect(stappenData[0].actief).toBe(false);
    expect(stappenData[0].voltooid).toBe(true);
    
    // Controleer of de tweede stap actief is
    expect(stappenData[1].actief).toBe(true);
    expect(stappenData[1].voltooid).toBe(false);
  });

  it('moet offline status correct verwerken', () => {
    // Simuleer offline status
    const networkService = TestBed.inject(NetworkService);
    (networkService as any).isOnline$ = of(false);
    
    // Initialiseer component opnieuw om de nieuwe observable te abonneren
    component.ngOnInit();
    
    // Controleer of setOfflineStatus is aangeroepen met true
    expect(mockState.setOfflineStatus).toHaveBeenCalledWith(true);
  });
});