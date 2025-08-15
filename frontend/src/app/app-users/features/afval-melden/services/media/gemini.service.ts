import { Injectable } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { environment } from '@environments/environment';
import { AfvalType } from '@app/models';

export interface DetectieResultaat {
  afvalTypes: AfvalType[];
  funFact: string;
}

/**
 * Compacte service voor afval classificatie via Gemini AI.
 * Max 120 regels, 80 chars per regel.
 */
@Injectable({ providedIn: 'root' })
export class GeminiService {
  private genAI = new GoogleGenerativeAI(environment.GEMINI_API_KEY);

  /**
   * Classificeert afval in een afbeelding.
   */
  async classifyAfval(imageBlob: Blob): Promise<DetectieResultaat> {
    try {
      const base64 = await this.blobToBase64(imageBlob);
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const prompt = this.buildPrompt();
      const result = await model.generateContent([
        prompt,
        { inlineData: { data: base64.split(',')[1], mimeType: imageBlob.type } }
      ]);

      return this.parseResponse(result.response.text());
    } catch (error) {
      console.error('Gemini classificatie fout:', error);
      return this.getDefaultResult();
    }
  }

  private buildPrompt(): string {
    return `Analyseer deze afbeelding en identificeer het type zwerfafval.
    
Geef een JSON response met:
- afvalTypes: array van AfvalType enums (PLASTIC, PAPIER, GLAS, etc.)
- funFact: interessant feit over dit afval (max 100 chars)

Voorbeeld: {"afvalTypes":["PLASTIC"],"funFact":"Plastic flessen kunnen 
gerecycled worden tot nieuwe flessen!"}`;
  }

  private parseResponse(response: string): DetectieResultaat {
    try {
      const cleanResponse = response.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanResponse);
      
      return {
        afvalTypes: parsed.afvalTypes || [AfvalType.RESTAFVAL],
        funFact: parsed.funFact || 'Bedankt voor het melden van zwerfafval!'
      };
    } catch {
      return this.getDefaultResult();
    }
  }

  private getDefaultResult(): DetectieResultaat {
    return {
      afvalTypes: [AfvalType.RESTAFVAL],
      funFact: 'We hebben je melding ontvangen en gaan ermee aan de slag!'
    };
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}