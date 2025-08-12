import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocatiePicker } from './locatie-picker';

describe('LocatiePicker', () => {
  let component: LocatiePicker;
  let fixture: ComponentFixture<LocatiePicker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocatiePicker]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocatiePicker);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
