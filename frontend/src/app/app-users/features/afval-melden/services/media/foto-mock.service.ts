import { Injectable } from '@angular/core';

/**
 * Mock foto service die test afbeeldingen gebruikt voor development en testing.
 */
@Injectable({ providedIn: 'root' })
export class FotoMockService {
  private readonly TEST_IMAGE_PATH = 'assets/test-images/zwerfafval-example.jpg';
  
  /**
   * Simuleer foto maken van camera - gebruikt test afbeelding
   */
  async maakFoto(): Promise<Blob> {
    console.log('📸 Mock: Camera foto maken...');
    
    // Simuleer camera delay
    await this.delay(1500);
    
    try {
      const blob = await this.loadTestImage();
      console.log('✅ Mock: Camera foto succesvol gemaakt');
      return blob;
    } catch (error) {
      console.error('❌ Mock: Camera foto maken mislukt:', error);
      throw new Error('Camera niet beschikbaar (mock)');
    }
  }

  /**
   * Simuleer foto kiezen uit galerij - gebruikt test afbeelding
   */
  async kiesFotoUitGalerij(): Promise<Blob> {
    console.log('🖼️ Mock: Foto uit galerij kiezen...');
    
    // Simuleer file picker delay
    await this.delay(800);
    
    try {
      const blob = await this.loadTestImage();
      console.log('✅ Mock: Galerij foto succesvol gekozen');
      return blob;
    } catch (error) {
      console.error('❌ Mock: Galerij foto kiezen mislukt:', error);
      throw new Error('Geen foto geselecteerd (mock)');
    }
  }

  /**
   * Optimaliseer foto (in mock gewoon doorsturen)
   */
  async optimaliseerFoto(file: File): Promise<Blob> {
    console.log('⚙️ Mock: Foto optimaliseren...');
    
    // Simuleer processing tijd
    await this.delay(500);
    
    // In mock: gebruik test afbeelding i.p.v. echte optimalisatie
    const blob = await this.loadTestImage();
    console.log('✅ Mock: Foto geoptimaliseerd');
    return blob;
  }

  /**
   * Converteer blob naar data URL
   */
  async blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Data URL conversie mislukt'));
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Valideer foto (altijd success in mock)
   */
  validateFoto(file: File): string | null {
    console.log('✅ Mock: Foto validatie - altijd geldig');
    return null;
  }

  /**
   * Laad test afbeelding van zwerfafval
   */
  private async loadTestImage(): Promise<Blob> {
    try {
      const response = await fetch(this.TEST_IMAGE_PATH);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.blob();
    } catch (error) {
      console.error('Test afbeelding laden mislukt:', error);
      
      // Fallback: genereer een simple test afbeelding
      return await this.generateFallbackImage();
    }
  }

  /**
   * Genereer fallback test afbeelding als bestand niet beschikbaar is
   */
  private async generateFallbackImage(): Promise<Blob> {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    
    const ctx = canvas.getContext('2d')!;
    
    // Achtergrond
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, 400, 300);
    
    // Prullenbak icoon (simpel)
    ctx.fillStyle = '#374151';
    ctx.fillRect(150, 100, 100, 120);
    ctx.fillRect(140, 90, 120, 20);
    
    // Afval rond prullenbak
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(100, 200, 20, 15);
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(280, 180, 25, 20);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(120, 230, 15, 10);
    
    // Tekst
    ctx.fillStyle = '#1f2937';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Test Zwerfafval Foto', 200, 50);
    ctx.font = '12px Arial';
    ctx.fillText('Mock afbeelding voor testing', 200, 270);
    
    return new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob || new Blob());
      }, 'image/png');
    });
  }

  /**
   * Utility: delay functie
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Krijg informatie over de test afbeelding
   */
  getTestImageInfo(): { path: string; description: string; usage: string } {
    return {
      path: this.TEST_IMAGE_PATH,
      description: 'Zwerfafval bij prullenbak - typisch scenario voor melding',
      usage: 'Test afbeelding gebruikt in mock services en Storybook demos'
    };
  }
}