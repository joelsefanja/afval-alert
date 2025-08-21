import { TestBed } from '@angular/core/testing';

import { DashboardItemService } from './dashboard-item.service.ts.js';

describe('DashboardItemService', () => {
  let service: DashboardItemService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardItemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
