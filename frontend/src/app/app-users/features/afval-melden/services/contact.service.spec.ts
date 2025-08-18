import { TestBed } from '@angular/core/testing';
import { ContactService, ContactGegevens } from '@app/app-users/features/afval-melden/services/contact.service';
import { expect } from '@playwright/test';

describe('ContactService', () => {
  let service: ContactService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ContactService]
    });
    service = TestBed.inject(ContactService);
  });

  it('moet service aanmaken', () => {
    expect(service).toBeTruthy();
  });

  describe('validateContactGegevens', () => {
    it('moet true retourneren voor anonieme melding zonder email', () => {
      const contactGegevens: ContactGegevens = {};
      expect(service.validateContactGegevens(contactGegevens)).toBe(true);
    });

    it('moet true retourneren voor geldige email', () => {
      const contactGegevens: ContactGegevens = {
        email: 'test@example.com'
      };
      expect(service.validateContactGegevens(contactGegevens)).toBe(true);
    });

    it('moet false retourneren voor ongeldige email', () => {
      const contactGegevens: ContactGegevens = {
        email: 'ongeldig-email'
      };
      expect(service.validateContactGegevens(contactGegevens)).toBe(false);
    });

    it('moet true retourneren voor geldige email met naam', () => {
      const contactGegevens: ContactGegevens = {
        email: 'test@example.com',
        naam: 'Test Gebruiker'
      };
      expect(service.validateContactGegevens(contactGegevens)).toBe(true);
    });
  });

  describe('saveContactGegevens', () => {
    it('moet een observable retourneren die true emitteert', (done) => {
      const contactGegevens: ContactGegevens = {
        email: 'test@example.com',
        naam: 'Test Gebruiker'
      };

      service.saveContactGegevens(contactGegevens).subscribe(result => {
        expect(result).toBe(true);
        done();
      });
    });
  });
});