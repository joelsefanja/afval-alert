import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OfflineNotificatieComponent } from './offline-notificatie.component';

describe('OfflineNotificatieComponent', () => {
  let component: OfflineNotificatieComponent;
  let fixture: ComponentFixture<OfflineNotificatieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfflineNotificatieComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OfflineNotificatieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be visible by default (component renders)', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('div > div')).toBeTruthy();
  });

  it('should have the correct styling', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const notification = compiled.querySelector('div > div');
    expect(notification?.classList).toContain('bg-amber-50');
    expect(notification?.classList).toContain('border-amber-200');
  });

  it('should display offline message', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('U bent offline');
    expect(compiled.textContent).toContain('Uw melding wordt opgeslagen');
  });
});