import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ControleStapComponent } from './controle-stap.component';

describe('ControleStapComponent', () => {
  let component: ControleStapComponent;
  let fixture: ComponentFixture<ControleStapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControleStapComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ControleStapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h3')?.textContent).toContain('Controleer uw melding');
  });

  it('should have a button to send the report', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('button.bg-primary')?.textContent).toContain('Versturen');
  });

  it('should have a button to adjust the report', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('button.bg-gray-200')?.textContent).toContain('Aanpassen');
  });

  it('should have the correct styling', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h3')?.classList).toContain('text-lg');
    expect(compiled.querySelector('button.bg-primary')?.classList).toContain('text-white');
  });
});
