import { Injectable, Inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { LocatieConfigService } from '../../../../../services/locatie-config.service';

export interface FormattedAddress {
  straat: string;
  huisnummer: string;
  postcode: string;
  plaats: string;
  land: string;
  wijk?: string;
  buurt?: string;
  gemeente?: string;
  provincie?: string;
  rawAddress: any;
}

@Injectable({
  providedIn: 'root'
})
export class GeocodingMockService {
  // Mock data voor testdoeleinden
  private mockAddresses = [
    {
      query: 'Grote Markt 1, Groningen',
      result: {
        lat: 53.2193835,
        lng: 6.5665017,
        display_name: 'Grote Markt 1, Groningen, Nederland',
        address: {
          road: 'Grote Markt',
          house_number: '1',
          postcode: '9712 EJ',
          city: 'Groningen',
          municipality: 'Groningen',
          county: 'Groningen',
          state: 'Groningen',
          country: 'Nederland',
          neighbourhood: 'Stadspark'
        }
      }
    },
    {
      query: 'Hoofdstation, Groningen',
      result: {
        lat: 53.210879,
        lng: 6.5665017,
        display_name: 'Hoofdstation Groningen, Nederland',
        address: {
          road: 'Hoofdstation',
          postcode: '9712 EJ',
          city: 'Groningen',
          municipality: 'Groningen',
          county: 'Groningen',
          state: 'Groningen',
          country: 'Nederland'
        }
      }
    }
  ];

  constructor(@Inject(LocatieConfigService) private locatieConfigService: LocatieConfigService) {}

  /**
   * Mock implementatie van adres ophalen op basis van coördinaten
   */
  getAddressFromCoordinates(lat: number, lon: number): Observable<FormattedAddress> {
    // Simuleer netwerkvertraging
    return of(this.formatMockAddress(lat, lon)).pipe(delay(300));
  }

  /**
   * Mock implementatie van coördinaten ophalen op basis van adres
   */
  getCoordinatesFromAddress(address: string): Observable<{ lat: number; lng: number; display_name: string; address: FormattedAddress }> {
    // Zoek in mock data
    const mockResult = this.mockAddresses.find(item => 
      item.query.toLowerCase().includes(address.toLowerCase())
    );
    
    if (mockResult) {
      // Simuleer netwerkvertraging
      return of({
        lat: mockResult.result.lat,
        lng: mockResult.result.lng,
        display_name: mockResult.result.display_name,
        address: this.formatAddress(mockResult.result)
      }).pipe(delay(300));
    } else {
      // Standaardwaarden als het adres niet in de mock data staat
      return of({
        lat: 53.2193835,
        lng: 6.5665017,
        display_name: address,
        address: this.formatAddress({
          lat: 53.2193835,
          lng: 6.5665017,
          display_name: address,
          address: {
            road: address.split(',')[0] || '',
            city: 'Groningen',
            municipality: 'Groningen',
            county: 'Groningen',
            state: 'Groningen',
            country: 'Nederland'
          }
        })
      }).pipe(delay(300));
    }
  }

  /**
   * Formatteer mock adresgegevens
   */
  private formatMockAddress(lat: number, lon: number): FormattedAddress {
    // In een echte mock zou je verschillende scenario's kunnen simuleren
    // Voor nu gebruiken we een standaardadres
    const address = {
      road: 'Mock Straat',
      house_number: '1',
      postcode: '9712 EJ',
      city: 'Groningen',
      municipality: 'Groningen',
      county: 'Groningen',
      state: 'Groningen',
      country: 'Nederland',
      neighbourhood: 'Mock Wijk'
    };
    
    return this.formatAddress({ lat, lng: lon, display_name: 'Mock Adres', address });
  }

  /**
   * Formatteer adresgegevens
   */
  private formatAddress(data: any): FormattedAddress {
    const address = data.address || {};
    
    const formatted: FormattedAddress = {
      straat: address.road || '',
      huisnummer: address.house_number || '',
      postcode: address.postcode || '',
      plaats: address.city || address.town || address.village || '',
      land: address.country || 'Nederland',
      wijk: address.neighbourhood || address.quarter || address.suburb,
      buurt: address.neighbourhood,
      gemeente: address.city || address.municipality,
      provincie: address.state,
      rawAddress: address
    };
    
    // Valideer op basis van configuratie
    if (!this.locatieConfigService.isToegestaanGebied(formatted)) {
      console.warn('Mock adres voldoet niet aan validatie eisen');
    }
    
    return formatted;
  }
}