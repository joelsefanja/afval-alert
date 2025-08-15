import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Kaart } from './kaart';

describe('Kaart', () => {
  let component: Kaart;
  let fixture: ComponentFixture<Kaart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Kaart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Kaart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
