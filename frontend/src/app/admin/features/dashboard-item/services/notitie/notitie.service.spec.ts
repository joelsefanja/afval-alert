import { TestBed } from '@angular/core/testing';

import { NotitieService } from './notitie.service';

describe('NotitieService', () => {
  let service: NotitieService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotitieService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
