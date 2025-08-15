import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HuidigeLocatie } from './huidige-locatie';

describe('HuidigeLocatie', () => {
  let component: HuidigeLocatie;
  let fixture: ComponentFixture<HuidigeLocatie>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HuidigeLocatie]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HuidigeLocatie);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
