import { TestBed } from '@angular/core/testing';

import { DashboardItemServiceTs } from './dashboard-item.service.ts';

describe('DashboardItemServiceTs', () => {
  let service: DashboardItemServiceTs;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardItemServiceTs);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
