import { TestBed } from '@angular/core/testing';

import { NotificatieService } from './notificatie.service';

describe('NotificatieService', () => {
  let service: NotificatieService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificatieService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
