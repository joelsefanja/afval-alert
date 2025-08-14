import type { Meta, StoryObj } from '@storybook/angular';
import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { firstValueFrom } from 'rxjs';
import { GeocodingOpenStreetMapService } from '../../services/locatie/geocoding-openstreetmap.service';

@Component({
  selector: 'app-api-demo',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, CardModule, InputTextModule],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="text-center">
        <h1 class="text-2xl font-bold mb-4">🌍 OpenStreetMap API Demo</h1>
        <p class="text-surface-600 dark:text-surface-300">
          Live test van de OpenStreetMap Nominatim API voor locatie analyse
        </p>
      </div>

      <!-- Test Controls -->
      <p-card>
        <h3 class="font-semibold mb-4">🧪 Test Locatie Analyse</h3>
        <div class="space-y-4">
          <div class="flex gap-2">
            <input 
              pInputText 
              [(ngModel)]="testInput"
              placeholder="Voer adres in (bijv: Grote Markt 1, Groningen)"
              class="flex-1"
            />
            <p-button 
              label="Test Adres" 
              (onClick)="testAdres()"
              [loading]="loading()"
            />
          </div>
          
          <div class="flex gap-2">
            <input 
              pInputText 
              [(ngModel)]="testLat"
              placeholder="Latitude (bijv: 53.2194)"
              class="flex-1"
            />
            <input 
              pInputText 
              [(ngModel)]="testLng"
              placeholder="Longitude (bijv: 6.5665)"
              class="flex-1"
            />
            <p-button 
              label="Test Coördinaten" 
              (onClick)="testCoordinaten()"
              [loading]="loading()"
            />
          </div>
          
          <div class="flex flex-wrap gap-2">
            <p-button 
              label="Grote Markt" 
              variant="outlined" 
              size="small"
              (onClick)="testPreset('Grote Markt 1, Groningen')"
            />
            <p-button 
              label="Martinitoren" 
              variant="outlined" 
              size="small"
              (onClick)="testPreset('Martinitoren, Groningen')"
            />
            <p-button 
              label="Noorderplantsoen" 
              variant="outlined" 
              size="small"
              (onClick)="testPreset('Noorderplantsoen, Groningen')"
            />
            <p-button 
              label="❌ Amsterdam (fout)" 
              variant="outlined" 
              size="small"
              (onClick)="testPreset('Amsterdam')"
              class="text-red-600"
            />
          </div>
        </div>
      </p-card>

      <!-- Results -->
      @if (result()) {
        <p-card>
          <h3 class="font-semibold mb-4">📊 API Response</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <!-- Locatie Resultaat -->
            <div>
              <h4 class="font-medium mb-2">🎯 Locatie Analyse</h4>
              <div class="bg-surface-100 dark:bg-surface-800 p-3 rounded text-sm">
                <div class="space-y-1">
                  <div class="flex justify-between">
                    <span>Provincie Groningen:</span>
                    <span class="font-mono {{ result()?.provincieGroningen ? 'text-green-600' : 'text-red-600' }}">
                      {{ result()?.provincieGroningen ? '✅' : '❌' }}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span>Gemeente Groningen:</span>
                    <span class="font-mono {{ result()?.gemeenteGroningen ? 'text-green-600' : 'text-red-600' }}">
                      {{ result()?.gemeenteGroningen ? '✅' : '❌' }}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span>Stad Groningen:</span>
                    <span class="font-mono {{ result()?.stadGroningen ? 'text-green-600' : 'text-gray-500' }}">
                      {{ result()?.stadGroningen ? '✅' : '➖' }}
                    </span>
                  </div>
                  @if (result()?.wijk) {
                    <div class="flex justify-between">
                      <span>Wijk:</span>
                      <span class="font-mono text-blue-600">{{ result()?.wijk }}</span>
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- Volledig Adres -->
            <div>
              <h4 class="font-medium mb-2">📍 Volledig Adres</h4>
              <div class="bg-surface-100 dark:bg-surface-800 p-3 rounded text-sm">
                <p class="font-mono">{{ result()?.volledigAdres }}</p>
              </div>
            </div>
          </div>
        </p-card>
      }

      @if (error()) {
        <p-card class="border-red-200 bg-red-50">
          <h3 class="font-semibold mb-2 text-red-800">❌ Fout</h3>
          <p class="text-red-700 text-sm">{{ error() }}</p>
        </p-card>
      }

      @if (rawApiResponse()) {
        <p-card>
          <h3 class="font-semibold mb-4">🔍 Ruwe API Response (Debug)</h3>
          <div class="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-auto">
            <pre>{{ rawApiResponse() | json }}</pre>
          </div>
        </p-card>
      }

      <!-- Info -->
      <p-card class="bg-blue-50 border-blue-200">
        <h3 class="font-semibold mb-2 text-blue-800">ℹ️ Over deze demo</h3>
        <div class="text-sm text-blue-700 space-y-2">
          <p>Deze demo gebruikt de echte OpenStreetMap Nominatim API om locaties te analyseren.</p>
          <p><strong>Validatie regels:</strong></p>
          <ul class="list-disc list-inside space-y-1 ml-4">
            <li>Alleen locaties in provincie Groningen zijn toegestaan</li>
            <li>Extra informatie wordt getoond voor stad en wijk (indien beschikbaar)</li>
            <li>Fallback naar coördinaten bij API problemen</li>
          </ul>
          <p class="pt-2 border-t border-blue-300">
            <strong>Rate limiting:</strong> De Nominatim API heeft rate limits. 
            Gebruik met mate tijdens development.
          </p>
        </div>
      </p-card>
    </div>
  `
})
class ApiDemoComponent implements OnInit {
  private geocodingService = inject(GeocodingOpenStreetMapService);
  
  testInput = 'Grote Markt 1, Groningen';
  testLat = '53.2194';
  testLng = '6.5665';
  
  loading = signal(false);
  result = signal<any>(null);
  error = signal<string>('');
  rawApiResponse = signal<any>(null);

  ngOnInit() {
    // Set Storybook environment
    if (typeof window !== 'undefined') {
      (window as any).storybookEnvironment = { useRealGeocodingApi: true };
    }
  }

  async testAdres() {
    if (!this.testInput.trim()) return;
    
    this.loading.set(true);
    this.error.set('');
    this.result.set(null);
    this.rawApiResponse.set(null);

    try {
      // Test geocoding first
      const coords = await firstValueFrom(this.geocodingService.getCoordinatenVanAdres(this.testInput));
      console.log('🎯 Coördinaten gevonden:', coords);
      
      // Then analyze location
      const locatieResult = await firstValueFrom(this.geocodingService.analyseLocatie(coords.latitude, coords.longitude));
      console.log('📊 Locatie analyse:', locatieResult);
      
      this.result.set(locatieResult);
      
      // Store raw response for debugging
      this.rawApiResponse.set({
        searchQuery: this.testInput,
        coordinates: coords,
        analysis: locatieResult
      });
      
    } catch (err: any) {
      console.error('❌ API fout:', err);
      this.error.set(err.message || 'Onbekende fout');
    } finally {
      this.loading.set(false);
    }
  }

  async testCoordinaten() {
    const lat = parseFloat(this.testLat);
    const lng = parseFloat(this.testLng);
    
    if (isNaN(lat) || isNaN(lng)) {
      this.error.set('Ongeldige coördinaten');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.result.set(null);
    this.rawApiResponse.set(null);

    try {
      const locatieResult = await firstValueFrom(this.geocodingService.analyseLocatie(lat, lng));
      console.log('📊 Locatie analyse:', locatieResult);
      
      this.result.set(locatieResult);
      this.rawApiResponse.set({
        coordinates: { latitude: lat, longitude: lng },
        analysis: locatieResult
      });
      
    } catch (err: any) {
      console.error('❌ API fout:', err);
      this.error.set(err.message || 'Onbekende fout');
    } finally {
      this.loading.set(false);
    }
  }

  testPreset(adres: string) {
    this.testInput = adres;
    this.testAdres();
  }
}

const meta: Meta<ApiDemoComponent> = {
  title: 'API Demo/OpenStreetMap Locatie Analyse',
  component: ApiDemoComponent,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# OpenStreetMap API Integration Demo

Deze interactieve demo laat zien hoe de OpenStreetMap Nominatim API wordt gebruikt voor locatie analyse in de afval-alert applicatie.

## Features

- **Real-time API testing**: Test echte adressen en coördinaten
- **Provincie validatie**: Alleen Groningen provincie toegestaan  
- **Uitgebreide analyse**: Provincie, gemeente, stad en wijk detectie
- **Error handling**: Graceful fallbacks bij API problemen
- **Debug informatie**: Ruwe API responses voor development

## Test Cases

### ✅ Geldige Groningen locaties:
- Grote Markt 1, Groningen
- Martinitoren, Groningen
- Noorderplantsoen, Groningen
- Herestraat 73, Groningen

### ❌ Ongeldige locaties:
- Amsterdam (buiten provincie)
- XYZ123 (onbestaand adres)

## API Rate Limiting

Let op: De Nominatim API heeft rate limits. Gebruik met mate tijdens development.
        `
      }
    }
  }
};

export default meta;
type Story = StoryObj<ApiDemoComponent>;

export const InteractiveDemo: Story = {
  name: '🌍 Interactieve API Demo',
};