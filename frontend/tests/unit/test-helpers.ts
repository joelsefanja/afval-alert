import { jest } from '@jest/globals';

// Type definitie voor Jest spy
type JestSpy = ReturnType<typeof jest.spyOn>;

/**
 * Test helper functie om protected methodes toegankelijk te maken voor tests
 * @param obj Het object waarvan protected methodes toegankelijk gemaakt moeten worden
 * @returns Het object met toegankelijke methodes
 */
export function toegankelijkVoorTests<T>(obj: T): any {
  return obj as any;
}

/**
 * Test helper functie om een Jest spy te maken voor navigator.mediaDevices.getUserMedia
 * @param returnValue De waarde die de spy moet teruggeven (Promise)
 * @returns De aangemaakte Jest spy
 */
export function maakMediaDevicesSpy(returnValue: Promise<MediaStream>): JestSpy {
  // Zorg ervoor dat mediaDevices bestaat
  if (!navigator.mediaDevices) {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: jest.fn()
      },
      writable: true
    });
  }
  
  // Maak een spy voor getUserMedia
  return jest.spyOn(navigator.mediaDevices, 'getUserMedia')
    .mockImplementation(() => returnValue);
}

/**
 * Test helper functie om een Jest spy te maken voor een output event
 * @param component Het component waarvan de output event bespied moet worden
 * @param outputName De naam van de output event
 * @returns De aangemaakte Jest spy
 */
export function maakOutputEventSpy<T>(component: any, outputName: keyof T): JestSpy {
  return jest.spyOn(component[outputName], 'emit');
}