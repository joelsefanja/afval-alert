import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SuccesStapComponent } from './succes-stap.component';

describe('SuccesStapComponent', () => {
  let component: SuccesStapComponent;
  let fixture: ComponentFixture<SuccesStapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuccesStapComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SuccesStapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a success message', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h2')?.textContent).toContain('Melding succesvol!');
  });

  it('should have a button to create a new report', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('button')?.textContent).toContain('Nieuwe melding maken');
  });

  it('should have the correct styling', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('div')?.classList).toContain('text-center');
    expect(compiled.querySelector('h2')?.classList).toContain('text-2xl');
    expect(compiled.querySelector('button')?.classList).toContain('bg-primary');
  });
});
