import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StartStapComponent } from './start-stap.component';
import { MeldingsProcedureStatus } from '../../services/melding/melding-state.service';

describe('StartStapComponent', () => {
  let component: StartStapComponent;
  let fixture: ComponentFixture<StartStapComponent>;
  let mockMeldingsProcedureStatus: jest.Mocked<MeldingsProcedureStatus>;

  beforeEach(async () => {
    const spy = {
      gaNaarVolgende: jest.fn()
    } as unknown as jest.Mocked<MeldingsProcedureStatus>;

    await TestBed.configureTestingModule({
      imports: [StartStapComponent],
      providers: [
        { provide: MeldingsProcedureStatus, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StartStapComponent);
    component = fixture.componentInstance;
    mockMeldingsProcedureStatus = TestBed.inject(MeldingsProcedureStatus) as jest.Mocked<MeldingsProcedureStatus>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call gaNaarVolgende when start is called', () => {
    component.start();
    expect(mockMeldingsProcedureStatus.gaNaarVolgende).toHaveBeenCalled();
  });

  it('should display the correct title', () => {
    fixture.detectChanges();
    const titleElement = fixture.nativeElement.querySelector('h1');
    expect(titleElement.textContent.trim()).toBe('Zie je zwerfafval?');
  });

  it('should display the start button', () => {
    fixture.detectChanges();
    const buttonElement = fixture.nativeElement.querySelector('p-button');
    expect(buttonElement).toBeTruthy();
  });
});