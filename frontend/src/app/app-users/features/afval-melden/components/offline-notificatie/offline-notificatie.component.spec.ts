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

  it('should not be visible when online', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.fixed')).toBeNull();
  });

  it('should be visible when offline', () => {
    component.isOffline = true;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.fixed')).not.toBeNull();
    expect(compiled.querySelector('p')?.textContent).toContain('U bent momenteel offline.');
  });

  it('should have the correct styling when offline', () => {
    component.isOffline = true;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.fixed')?.classList).toContain('bg-red-500');
    expect(compiled.querySelector('p')?.classList).toContain('text-white');
  });
});
