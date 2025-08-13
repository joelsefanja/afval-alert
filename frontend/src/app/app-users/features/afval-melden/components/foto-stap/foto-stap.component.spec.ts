import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FotoStapComponent } from './foto-stap.component';

describe('FotoStapComponent', () => {
  let component: FotoStapComponent;
  let fixture: ComponentFixture<FotoStapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FotoStapComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FotoStapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a button to take a photo', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('button.bg-primary')?.textContent).toContain('Maak een foto');
  });

  it('should have a button to choose a photo', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('button.bg-gray-200')?.textContent).toContain('Kies een foto');
  });

  it('should have the correct styling', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h3')?.classList).toContain('text-lg');
    expect(compiled.querySelector('button.bg-primary')?.classList).toContain('text-white');
  });
});
