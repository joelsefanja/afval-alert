import { ComponentFixture, TestBed } from '@angular/core/testing';
import { jest } from '@jest/globals';
// Importeer de test helpers
import { toegankelijkVoorTests, maakMediaDevicesSpy, maakOutputEventSpy } from './test-helpers';

/**
 * Dit is een voorbeeld test bestand dat laat zien hoe de test helpers
 * gedeeld kunnen worden tussen meerdere tests.
 */
describe('VoorbeeldComponent', () => {
  // Voorbeeld van een test die de toegankelijkVoorTests helper gebruikt
  it('kan protected methodes aanroepen met toegankelijkVoorTests', () => {
    // Voorbeeld component met protected methode
    class VoorbeeldComponent {
      protected protectedMethode(): string {
        return 'resultaat';
      }
    }
    
    const component = new VoorbeeldComponent();
    
    // Gebruik de helper om toegang te krijgen tot de protected methode
    const resultaat = toegankelijkVoorTests(component).protectedMethode();
    
    expect(resultaat).toBe('resultaat');
  });
  
  // Voorbeeld van een test die de maakMediaDevicesSpy helper gebruikt
  it('kan camera functionaliteit testen met maakMediaDevicesSpy', async () => {
    // Mock stream aanmaken
    const mockStream = {} as MediaStream;
    
    // Gebruik de helper om een spy te maken voor getUserMedia
    const mediaDevicesSpy = maakMediaDevicesSpy(Promise.resolve(mockStream));
    
    // Voorbeeld functie die getUserMedia gebruikt
    async function startCamera() {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      return stream;
    }
    
    // Test de functie
    const resultaat = await startCamera();
    
    // Verificatie
    expect(mediaDevicesSpy).toHaveBeenCalled();
    expect(resultaat).toBe(mockStream);
    
    // Cleanup
    mediaDevicesSpy.mockRestore();
  });
  
  // Voorbeeld van een test die de maakOutputEventSpy helper gebruikt
  it('kan output events testen met maakOutputEventSpy', () => {
    // Voorbeeld component met output event
    const component = {
      outputEvent: {
        emit: jest.fn()
      }
    };
    
    // Gebruik de helper om een spy te maken voor de output event
    const outputSpy = maakOutputEventSpy(component, 'outputEvent');
    
    // Roep de emit functie aan
    component.outputEvent.emit('data');
    
    // Verificatie
    expect(outputSpy).toHaveBeenCalledWith('data');
  });
});