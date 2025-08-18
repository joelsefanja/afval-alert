import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TijdlijnElement } from './tijdlijn-element';

describe('TijdlijnElement', () => {
  let component: TijdlijnElement;
  let fixture: ComponentFixture<TijdlijnElement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TijdlijnElement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TijdlijnElement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
