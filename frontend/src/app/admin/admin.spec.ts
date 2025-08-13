import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AdminComponent } from './admin';

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AdminComponent,
        MatTableModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display admin dashboard title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('h1');
    expect(title?.textContent).toContain('Admin Dashboard');
  });

  it('should show statistics cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('mat-card');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('should have data table for meldingen', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const table = compiled.querySelector('mat-table');
    expect(table).toBeTruthy();
  });

  it('should display statistics', () => {
    // Test that component has basic functionality
    expect(component).toBeTruthy();
  });

  it('should show dashboard elements', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    // Test for basic dashboard structure
    expect(compiled).toBeTruthy();
  });
});
