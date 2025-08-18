import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

// Mock interfaces
export interface MockGeocodingResponse {
  features: Array<{
    properties: {
      display_name: string;
      name?: string;
    };
    geometry: {
      coordinates: [number, number]; // [longitude, latitude]
    };
  }>;
}

export interface MockSubmissionResponse {
  success: boolean;
  id?: string;
  message?: string;
  error?: string;
}

export interface MockAfvalHerkenningResponse {
  type: string;
  confidence: number;
  suggestions: string[];
}

// Mock configuration service
@Injectable({
  providedIn: 'root'
})
export class MockConfigService {
  private config = {
    apiBaseUrl: 'http://localhost:3000/api',
    geocodingService: 'nominatim',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    gemeente: {
      naam: 'Amsterdam',
      bounds: {
        north: 52.4312,
        south: 52.2979,
        east: 5.0792,
        west: 4.7289
      }
    }
  };

  getConfig(): any {
    return this.config;
  }

  updateConfig(updates: Partial<typeof this.config>): void {
    this.config = { ...this.config, ...updates };
  }
}

// Mock geocoding service
@Injectable({
  providedIn: 'root'
})
export class MockGeocodingService {
  private mockAddresses = [
    {
      display_name: 'Damrak 1, 1012 LG Amsterdam, Nederland',
      coordinates: [4.9041, 52.3676] as [number, number]
    },
    {
      display_name: 'Museumplein 6, 1071 DJ Amsterdam, Nederland', 
      coordinates: [4.8799, 52.3580] as [number, number]
    },
    {
      display_name: 'Vondelpark, 1071 AA Amsterdam, Nederland',
      coordinates: [4.8686, 52.3579] as [number, number]
    }
  ];

  searchAddress(query: string): Observable<MockGeocodingResponse> {
    const filteredAddresses = this.mockAddresses.filter(addr => 
      addr.display_name.toLowerCase().includes(query.toLowerCase())
    );

    return of({
      features: filteredAddresses.map(addr => ({
        properties: {
          display_name: addr.display_name,
          name: addr.display_name.split(',')[0]
        },
        geometry: {
          coordinates: addr.coordinates
        }
      }))
    }).pipe(delay(300)); // Simulate network delay
  }

  reverseGeocode(lat: number, lon: number): Observable<MockGeocodingResponse> {
    // Find closest address (simplified)
    const closest = this.mockAddresses[0];
    
    return of({
      features: [{
        properties: {
          display_name: closest.display_name,
          name: closest.display_name.split(',')[0]
        },
        geometry: {
          coordinates: closest.coordinates
        }
      }]
    }).pipe(delay(200));
  }
}

// Mock submission service
@Injectable({
  providedIn: 'root'
})
export class MockSubmissionService {
  private submissions: Array<{
    id: string;
    timestamp: Date;
    foto: string;
    locatie: { lat: number; lon: number; address: string };
    contact?: { email?: string; phone?: string };
    status: 'submitted' | 'processing' | 'completed';
  }> = [];

  submitMelding(data: {
    foto: string;
    locatie: { lat: number; lon: number; address: string };
    contact?: { email?: string; phone?: string };
  }): Observable<MockSubmissionResponse> {
    const id = `MOCK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate validation
    if (!data.foto || !data.locatie) {
      return throwError(() => ({
        success: false,
        error: 'Foto en locatie zijn verplicht'
      })).pipe(delay(100));
    }

    // Simulate successful submission
    this.submissions.push({
      id,
      timestamp: new Date(),
      foto: data.foto,
      locatie: data.locatie,
      contact: data.contact,
      status: 'submitted'
    });

    return of({
      success: true,
      id,
      message: 'Melding succesvol ingediend'
    }).pipe(delay(500));
  }

  getSubmissionStatus(id: string): Observable<MockSubmissionResponse> {
    const submission = this.submissions.find(s => s.id === id);
    
    if (!submission) {
      return throwError(() => ({
        success: false,
        error: 'Melding niet gevonden'
      })).pipe(delay(100));
    }

    return of({
      success: true,
      id: submission.id,
      message: `Status: ${submission.status}`
    }).pipe(delay(200));
  }

  getAllSubmissions(): Array<any> {
    return [...this.submissions];
  }

  clearSubmissions(): void {
    this.submissions = [];
  }
}

// Mock afval herkenning service
@Injectable({
  providedIn: 'root'
})
export class MockAfvalHerkenningService {
  private afvalTypes = [
    { type: 'plastic', keywords: ['fles', 'plastic', 'verpakking'] },
    { type: 'papier', keywords: ['papier', 'karton', 'krant'] },
    { type: 'glas', keywords: ['fles', 'glas', 'pot'] },
    { type: 'restafval', keywords: ['rest', 'afval', 'vuilnis'] },
    { type: 'organisch', keywords: ['voedsel', 'fruit', 'groente'] }
  ];

  analyzePhoto(photoData: string): Observable<MockAfvalHerkenningResponse> {
    // Simulate AI analysis delay
    return of({
      type: 'plastic',
      confidence: 0.85,
      suggestions: [
        'Plastic fles - PMD container',
        'Zorg dat de fles leeg is',
        'Dop mag er op blijven'
      ]
    }).pipe(delay(800));
  }

  getAfvalTypes(): Array<string> {
    return this.afvalTypes.map(t => t.type);
  }

  getSuggestions(type: string): Array<string> {
    const typeInfo = this.afvalTypes.find(t => t.type === type);
    
    const suggestions = {
      plastic: [
        'Plastic verpakkingen horen in de PMD container',
        'Maak verpakkingen leeg voordat je ze weggooit',
        'Kleine plastic items kunnen bij het restafval'
      ],
      papier: [
        'Oud papier hoort in de papiercontainer',
        'Verwijder plastic vensters uit enveloppen',
        'Vies papier hoort bij het restafval'
      ],
      glas: [
        'Glas hoort in de glascontainer',
        'Sorteer op kleur: wit, bruin, groen',
        'Kurken en doppen eerst verwijderen'
      ],
      organisch: [
        'GFT-afval hoort in de groene container',
        'Ook tuinafval kan bij het GFT',
        'Geen plastic zakjes in de GFT container'
      ],
      restafval: [
        'Restafval hoort in de grijze container',
        'Probeer eerst te scheiden',
        'Gevaarlijk afval naar de milieustraat'
      ]
    };

    return suggestions[type as keyof typeof suggestions] || ['Onbekend afvaltype'];
  }
}

// Mock network service
@Injectable({
  providedIn: 'root'
})
export class MockNetworkService {
  private _isOnline = true;
  
  get isOnline(): boolean {
    return this._isOnline;
  }

  get isOnline$(): Observable<boolean> {
    return of(this._isOnline);
  }

  setOnlineStatus(online: boolean): void {
    this._isOnline = online;
  }

  simulateOffline(duration: number = 5000): void {
    this._isOnline = false;
    setTimeout(() => {
      this._isOnline = true;
    }, duration);
  }
}

// Mock storage service
@Injectable({
  providedIn: 'root'
})
export class MockStorageService {
  private storage = new Map<string, any>();

  setItem(key: string, value: any): void {
    this.storage.set(key, JSON.stringify(value));
  }

  getItem(key: string): any {
    const value = this.storage.get(key);
    return value ? JSON.parse(value) : null;
  }

  removeItem(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }

  getAllKeys(): string[] {
    return Array.from(this.storage.keys());
  }

  hasItem(key: string): boolean {
    return this.storage.has(key);
  }
}

// Mock validation service
@Injectable({
  providedIn: 'root'
})
export class MockValidationService {
  validateEmail(email: string): { valid: boolean; error?: string } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, error: 'Ongeldig email adres' };
    }
    return { valid: true };
  }

  validatePhone(phone: string): { valid: boolean; error?: string } {
    const phoneRegex = /^(\+31|0)[0-9]{9}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return { valid: false, error: 'Ongeldig telefoonnummer' };
    }
    return { valid: true };
  }

  validateImage(file: File): { valid: boolean; error?: string } {
    const config = new MockConfigService().getConfig();
    
    if (file.size > config.maxFileSize) {
      return { valid: false, error: 'Bestand te groot (max 10MB)' };
    }

    if (!config.supportedImageTypes.includes(file.type)) {
      return { valid: false, error: 'Bestandstype niet ondersteund' };
    }

    return { valid: true };
  }

  validateCoordinates(lat: number, lon: number): { valid: boolean; error?: string } {
    const config = new MockConfigService().getConfig();
    const bounds = config.gemeente.bounds;

    if (lat < bounds.south || lat > bounds.north || 
        lon < bounds.west || lon > bounds.east) {
      return { valid: false, error: 'Locatie valt buiten gemeente grenzen' };
    }

    return { valid: true };
  }
}

// Export all mock services for easy importing
export const MOCK_SERVICES = [
  MockConfigService,
  MockGeocodingService,
  MockSubmissionService,
  MockAfvalHerkenningService,
  MockNetworkService,
  MockStorageService,
  MockValidationService
] as const;