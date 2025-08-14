import type { Meta, StoryObj } from '@storybook/angular';
import { signal } from '@angular/core';
import { LocatieStapComponent } from './locatie-stap.component';
import { MeldingsProcedureStatus } from '../../services/melding/melding-state.service';
import { LocatieService } from '../../services/locatie/locatie.service';
import { GEOCODING_SERVICE_TOKEN } from '../../interfaces/geocoding.interface';
import { GeocodingOpenStreetMapService } from '../../services/locatie/geocoding-openstreetmap.service';

// Mock state service
const mockMeldingsProcedureStatus = {
  locatieAdres: signal(''),
  locatieError: signal(''),
  locatieCoordinaten: signal(null),
  gaTerugNaarVorige: () => console.log('👈 Terug naar vorige stap'),
  gaNaarVolgende: () => console.log('👉 Naar volgende stap'),
  setLocatie: (adres: string, coords: any) => {
    console.log('📍 Locatie ingesteld:', adres, coords);
    mockMeldingsProcedureStatus.locatieAdres.set(adres);
    mockMeldingsProcedureStatus.locatieCoordinaten.set(coords);
  },
  setLocatieError: (error: string) => {
    console.log('❌ Locatie fout:', error);
    mockMeldingsProcedureStatus.locatieError.set(error);
  }
} as any;

const mockLocatieService = {
  getCurrentPosition: () => Promise.resolve({
    coords: { latitude: 53.2194, longitude: 6.5665 }
  }),
  getAddressFromCoordinates: () => Promise.resolve('Grote Markt 1, Groningen'),
  getCoordinatesFromAddress: () => Promise.resolve({ lat: 53.2194, lng: 6.5665 })
} as any;

const meta: Meta<LocatieStapComponent> = {
  title: 'Components/Locatie Stap',
  component: LocatieStapComponent,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (story, context) => ({
      template: `
        <div class="min-h-screen bg-surface-50 dark:bg-surface-950 p-4">
          <div class="mb-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
            <h3 class="font-semibold text-blue-800">🗺️ OpenStreetMap API Demo</h3>
            <p class="text-sm text-blue-700">Deze story gebruikt de echte OpenStreetMap Nominatim API voor locatie analyse.</p>
            <p class="text-xs text-blue-600 mt-1">Kijk in de browser console voor API responses!</p>
          </div>
          <story-outlet></story-outlet>
        </div>
      `,
      providers: [
        { provide: MeldingsProcedureStatus, useValue: mockMeldingsProcedureStatus },
        { provide: LocatieService, useValue: mockLocatieService },
        { provide: GEOCODING_SERVICE_TOKEN, useClass: GeocodingOpenStreetMapService }
      ]
    })
  ]
};

export default meta;
type Story = StoryObj<LocatieStapComponent>;

export const Default: Story = {
  name: '🗺️ Standaard - Locatie invoer',
  parameters: {
    docs: {
      description: {
        story: 'Standaard locatie stap met Leaflet kaart gecentreerd op Groningen en OpenStreetMap API integratie.'
      }
    }
  }
};

export const MetGroningenLocatie: Story = {
  name: '✅ Met Groningen locatie (API Success)',
  play: async () => {
    // Reset state voor demo
    mockMeldingsProcedureStatus.locatieAdres.set('Grote Markt 1, 9712 HN Groningen');
    mockMeldingsProcedureStatus.locatieCoordinaten.set({ lat: 53.2194, lng: 6.5665 });
    mockMeldingsProcedureStatus.locatieError.set('');
  }
};

export const MetError: Story = {
  name: '❌ Met foutmelding',
  play: async () => {
    mockMeldingsProcedureStatus.locatieError.set('Locatie ligt buiten provincie Groningen');
    mockMeldingsProcedureStatus.locatieAdres.set('');
  }
};

export const RealApiDemo: Story = {
  name: '🌐 Live API Demo - Test bekende adressen',
  parameters: {
    docs: {
      description: {
        story: `
          **Live OpenStreetMap API Demo**
          
          Test deze bekende Groningen adressen:
          - Grote Markt 1, Groningen
          - Herestraat 73, Groningen  
          - Vismarkt 20, Groningen
          - Martinikerkhof, Groningen
          - Noorderplantsoen, Groningen
          
          **Verwacht gedrag:**
          - ✅ Provincie Groningen wordt herkend
          - 🏙️ Stad Groningen wordt getoond (indien van toepassing)
          - 🏘️ Wijk informatie wordt getoond (indien beschikbaar)
          - 🗺️ Kaart wordt gecentreerd op de locatie
          
          **Test ook foutscenario's:**
          - Probeer "Amsterdam" (buiten provincie)
          - Probeer "XYZ123" (ongeldig adres)
        `
      }
    }
  },
  play: async () => {
    // Reset alle states voor een schone demo
    mockMeldingsProcedureStatus.locatieAdres.set('');
    mockMeldingsProcedureStatus.locatieError.set('');
    mockMeldingsProcedureStatus.locatieCoordinaten.set(null);
    
    console.log('🚀 Live API Demo ready! Test bekende Groningen adressen in de UI.');
  }
};

export const MockGPSDemo: Story = {
  name: '📍 GPS Simulatie Demo',
  parameters: {
    docs: {
      description: {
        story: `
          **GPS Simulatie met echte API**
          
          Deze demo simuleert verschillende GPS locaties en gebruikt de echte API voor analyse.
          Klik op "Haal mijn locatie op" om de gesimuleerde GPS te testen.
        `
      }
    }
  },
  play: async () => {
    // Mock different GPS locations for testing
    const mockPositions = [
      { lat: 53.2194, lng: 6.5665, name: 'Groningen Centrum' },
      { lat: 53.2024, lng: 6.5318, name: 'Groningen Zuid' },
      { lat: 53.2300, lng: 6.5500, name: 'Groningen Noord' }
    ];
    
    const randomPosition = mockPositions[Math.floor(Math.random() * mockPositions.length)];
    
    // Override geolocation for this story
    if (typeof navigator !== 'undefined') {
      (navigator as any).geolocation = {
        getCurrentPosition: (success: PositionCallback) => {
          console.log(`🛰️ GPS Simulatie: ${randomPosition.name}`);
          const position: GeolocationPosition = {
            coords: {
              latitude: randomPosition.lat,
              longitude: randomPosition.lng,
              accuracy: 10,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null,
              toJSON() { return this; }
            },
            timestamp: Date.now(),
            toJSON() { return this; }
          };
          setTimeout(() => success(position), 500);
        }
      };
    }
    
    console.log(`📍 GPS mock ingesteld voor: ${randomPosition.name}`);
  }
};