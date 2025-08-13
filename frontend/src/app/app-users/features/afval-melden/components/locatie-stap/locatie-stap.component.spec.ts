import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocatieStapComponent } from './locatie-stap.component';

describe('LocatieStapComponent', () => {
  let component: LocatieStapComponent;
  let fixture: ComponentFixture<LocatieStapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocatieStapComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LocatieStapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h3')?.textContent).toContain('Kies de locatie van het afval');
  });

  it('should have a button to go to the next step', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('button')?.textContent).toContain('Volgende');
  });

  it('should have the correct styling', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h3')?.classList).toContain('text-lg');
    expect(compiled.querySelector('button')?.classList).toContain('bg-primary');
  });
});
