import { TestBed } from '@angular/core/testing';

import { Kaart } from './kaart';

describe('Kaart', () => {
  let service: Kaart;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Kaart);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
