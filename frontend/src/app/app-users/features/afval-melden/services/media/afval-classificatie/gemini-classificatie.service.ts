import { Injectable } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { IAfvalClassificatieService, AfvalClassificatieResponse } from '../../../interfaces/afval-classificatie.interface';
import { environment } from '../../../../../../../../environments/environment.development';

/**
 * GeminiClassificatieService - Development Gemini SDK implementation
 * Uses Google Gemini SDK directly for waste classification
 * For production, use ProductionClassificatieService (Python microservice)
 */
@Injectable({
  providedIn: 'root'
})
export class GeminiClassificatieService implements IAfvalClassificatieService {
  private readonly genAI: GoogleGenerativeAI;
  
  constructor() {
    const apiKey = environment.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key niet geconfigureerd');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async classificeerAfval(fotoBlob: Blob): Promise<AfvalClassificatieResponse> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
    Analyseer deze afbeelding en identificeer welke afval categorieën aanwezig zijn.
    Geef voor elke categorie een confidence score tussen 0.0 en 1.0.
    Alleen categorieën met confidence > 0.0 retourneren.
    
    Gebruik EXACT deze 11 categorieën:
    - "Grofvuil"
    - "Restafval" 
    - "Glas"
    - "Papier en karton"
    - "Organisch"
    - "Textiel"
    - "Elektronisch afval"
    - "Bouw- en sloopafval"
    - "Chemisch afval"
    - "Overig"
    - "Geen afval"
    
    Retourneer exact dit JSON format:
    {
      "afval_typen": [
        {"afval_type": "exact_category_name", "confidence": 0.xx}
      ]
    }
    `;

    try {
      // Convert blob to base64 for Gemini SDK
      const base64Image = await this.blobToBase64(fotoBlob);
      
      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType: fotoBlob.type
        }
      };

      const result = await model.generateContent([prompt, imagePart]);
      const text = result.response.text();
      
      if (!text) throw new Error('Geen response van Gemini');

      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Geen geldige JSON in response');

      const classificationResult: AfvalClassificatieResponse = JSON.parse(jsonMatch[0]);
      
      // Validate and filter confidence > 0
      classificationResult.afval_typen = classificationResult.afval_typen.filter(item => 
        item.confidence > 0 && item.confidence <= 1
      );

      return classificationResult;

    } catch (error) {
      console.error('Gemini SDK fout:', error);
      throw new Error('Afval classificatie mislukt');
    }
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:image/...;base64, prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}