import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailHeader } from './detail-header';

describe('DetailHeader', () => {
  let component: DetailHeader;
  let fixture: ComponentFixture<DetailHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
