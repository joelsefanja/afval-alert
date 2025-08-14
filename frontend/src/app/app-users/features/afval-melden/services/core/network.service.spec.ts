import { TestBed } from '@angular/core/testing';
import { NetworkService } from './network.service';

describe('NetworkService', () => {
  let service: NetworkService;
  let originalNavigator: any;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NetworkService);
    
    // Backup original navigator
    originalNavigator = (window as any).navigator;
  });

  afterEach(() => {
    // Restore original navigator
    (window as any).navigator = originalNavigator;
  });

  it('moet service aanmaken', () => {
    expect(service).toBeTruthy();
  });

  it('moet online status detecteren', (done) => {
    // Mock navigator.onLine
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      value: true
    });

    service.isOnline$.subscribe(isOnline => {
      expect(isOnline).toBe(true);
      done();
    });
  });

  it('moet offline status detecteren', (done) => {
    // Mock navigator.onLine
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      value: false
    });

    service.isOnline$.subscribe(isOnline => {
      expect(isOnline).toBe(false);
      done();
    });
  });

  it('moet status wijzigingen detecteren', (done) => {
    let callCount = 0;
    const expectedValues = [true, false];

    service.isOnline$.subscribe(isOnline => {
      expect(isOnline).toBe(expectedValues[callCount]);
      callCount++;
      
      if (callCount === expectedValues.length) {
        done();
      }
    });

    // Simuleer status wijzigingen
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      value: true
    });

    // Trigger online event
    window.dispatchEvent(new Event('online'));

    setTimeout(() => {
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: false
      });
      
      // Trigger offline event
      window.dispatchEvent(new Event('offline'));
    }, 10);
  });
});