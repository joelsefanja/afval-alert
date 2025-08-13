import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactStapComponent } from './contact-stap.component';

describe('ContactStapComponent', () => {
  let component: ContactStapComponent;
  let fixture: ComponentFixture<ContactStapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactStapComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactStapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h3')?.textContent).toContain('Uw contactgegevens (optioneel)');
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
