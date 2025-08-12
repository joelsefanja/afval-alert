import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppUsers } from './app-users';

describe('AppUsers', () => {
  let component: AppUsers;
  let fixture: ComponentFixture<AppUsers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppUsers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppUsers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
