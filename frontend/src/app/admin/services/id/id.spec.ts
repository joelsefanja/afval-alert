import { TestBed } from '@angular/core/testing';

import { IDService } from './id';

describe('Id', () => {
  let service: IDService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IDService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
