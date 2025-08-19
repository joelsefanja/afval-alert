import { Injectable, inject } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { environment } from '@environments/environment';
import { AfvalType } from '@app/models/afval-herkenning';
import { GeminiConfigService } from './gemini-config.service';
import { GeminiAfvalAnalyseResponse, AfvalTypeDetectie } from '../../interfaces/gemini-response.interface';

export interface DetectieResultaat {
  afvalTypes: AfvalType[];
  funFact: string;
  isAfval: boolean;
  kenmerken: string[];
  zekerheidsScores: number[];
}

/**
 * Productie-klare Gemini 2.5 Flash service voor zwerfafval herkenning.
 * Implementeert echte Google Gemini API met Nederlandse gemeente prompts.
 */
@Injectable({ providedIn: 'root' })
export class GeminiService {
  private genAI = new GoogleGenerativeAI(environment.GEMINI_API_KEY);
  private config = inject(GeminiConfigService);

  /**
   * Classificeert afval in een afbeelding met Gemini 2.5 Flash.
   */
  async classifyAfval(imageBlob: Blob): Promise<DetectieResultaat> {
    try {
      console.log('🔍 Starting Gemini 2.0 Flash afval analysis...');
      
      // Controleer of we een API key hebben
      if (!environment.GEMINI_API_KEY) {
        console.warn('⚠️ Geen Gemini API key geconfigureerd, gebruik fallback');
        return this.getErrorFallback();
      }
      
      const base64 = await this.blobToBase64(imageBlob);
      const model = this.genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash-exp',  // Using latest Gemini 2.0 Flash
        generationConfig: {
          temperature: 0.3,  // Lower temperature for more consistent results
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 1024
        }
      });
      
      const prompt = this.config.getImageAnalysisPrompt();
      
      console.log('📤 Sending request to Gemini 2.0 Flash...');
      const result = await model.generateContent([
        { text: prompt },
        { 
          inlineData: { 
            data: base64.split(',')[1], 
            mimeType: imageBlob.type 
          } 
        }
      ]);

      const response = result.response.text();
      console.log('📥 Received response from Gemini:', response);
      
      return this.parseGeminiResponse(response);
    } catch (error) {
      console.error('❌ Gemini 2.0 Flash classificatie fout:', error);
      return this.getErrorFallback();
    }
  }

  /**
   * Valideert lokale AI resultaten met Gemini.
   */
  async validateLocalResults(localDescription: string, localPredictions: string): Promise<DetectieResultaat> {
    try {
      console.log('🔍 Starting Gemini validation of local results...');
      
      const model = this.genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
          temperature: 0.2,
          topP: 0.7,
          maxOutputTokens: 512
        }
      });
      
      const prompt = this.config.getTextValidationPrompt(localDescription, localPredictions);
      
      const result = await model.generateContent([{ text: prompt }]);
      const response = result.response.text();
      
      console.log('📥 Received validation response:', response);
      
      return this.parseGeminiResponse(response);
    } catch (error) {
      console.error('❌ Gemini validation fout:', error);
      return this.getValidationFallback();
    }
  }

  private parseGeminiResponse(response: string): DetectieResultaat {
    try {
      // Clean response van mogelijk markdown formatting
      const cleanResponse = response
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .replace(/^\s*[\r\n]/gm, '')
        .trim();
      
      console.log('🧹 Cleaned response:', cleanResponse);
      
      const parsed: GeminiAfvalAnalyseResponse = JSON.parse(cleanResponse);
      
      // Valideer response structure
      if (!this.isValidGeminiResponse(parsed)) {
        console.warn('⚠️ Invalid response structure, using fallback');
        return this.getStructureFallback();
      }
      
      // Converteer naar DetectieResultaat format
      return this.convertToDetectieResultaat(parsed);
      
    } catch (error) {
      console.error('❌ JSON parsing fout:', error);
      console.error('Raw response was:', response);
      return this.getParsingFallback();
    }
  }

  private isValidGeminiResponse(response: any): response is GeminiAfvalAnalyseResponse {
    return response &&
           typeof response.is_afval === 'boolean' &&
           Array.isArray(response.afval_types) &&
           Array.isArray(response.kenmerken) &&
           typeof response.bedank_boodschap === 'string';
  }

  private convertToDetectieResultaat(geminiResponse: GeminiAfvalAnalyseResponse): DetectieResultaat {
    const afvalTypes: AfvalType[] = geminiResponse.afval_types.map(item => ({
      id: item.afval_type,
      naam: this.getDisplayName(item.afval_type),
      beschrijving: `Gemini detectie met ${Math.round(item.zekerheid * 100)}% zekerheid`,
      kleur: this.getTypeColor(item.afval_type),
      icoon: this.getTypeIcon(item.afval_type)
    }));

    return {
      afvalTypes: afvalTypes.length > 0 ? afvalTypes : [this.getDefaultAfvalType()],
      funFact: geminiResponse.bedank_boodschap,
      isAfval: geminiResponse.is_afval,
      kenmerken: geminiResponse.kenmerken,
      zekerheidsScores: geminiResponse.afval_types.map(item => item.zekerheid)
    };
  }

  private getDisplayName(afvalType: string): string {
    const displayNames: Record<string, string> = {
      'plastic_flessen': 'Plastic flessen',
      'plastic_zakken': 'Plastic zakken',
      'blikjes': 'Blikjes',
      'glas': 'Glas',
      'papier': 'Papier',
      'karton': 'Karton',
      'sigarettenpeuken': 'Sigarettenpeuken',
      'voedselresten': 'Voedselresten',
      'hondenpoop': 'Hondenpoep',
      'elektronisch_afval': 'Elektronisch afval',
      'textiel': 'Textiel',
      'metaal': 'Metaal',
      'batterijen': 'Batterijen',
      'chemisch_afval': 'Chemisch afval',
      'gemengd_afval': 'Gemengd afval',
      'niet_classificeerbaar': 'Niet classificeerbaar'
    };
    return displayNames[afvalType] || afvalType;
  }

  private getTypeColor(afvalType: string): string {
    const colors: Record<string, string> = {
      'plastic_flessen': '#3B82F6',
      'plastic_zakken': '#6366F1',
      'blikjes': '#8B5CF6',
      'glas': '#10B981',
      'papier': '#F59E0B',
      'karton': '#D97706',
      'sigarettenpeuken': '#EF4444',
      'voedselresten': '#84CC16',
      'hondenpoop': '#A3A3A3',
      'elektronisch_afval': '#6B7280',
      'textiel': '#EC4899',
      'metaal': '#64748B',
      'batterijen': '#DC2626',
      'chemisch_afval': '#B91C1C',
      'gemengd_afval': '#6B7280',
      'niet_classificeerbaar': '#9CA3AF'
    };
    return colors[afvalType] || '#6B7280';
  }

  private getTypeIcon(afvalType: string): string {
    const icons: Record<string, string> = {
      'plastic_flessen': 'pi-circle',
      'plastic_zakken': 'pi-shopping-bag',
      'blikjes': 'pi-circle',
      'glas': 'pi-circle',
      'papier': 'pi-file',
      'karton': 'pi-box',
      'sigarettenpeuken': 'pi-ban',
      'voedselresten': 'pi-heart',
      'hondenpoop': 'pi-ban',
      'elektronisch_afval': 'pi-mobile',
      'textiel': 'pi-tags',
      'metaal': 'pi-circle',
      'batterijen': 'pi-bolt',
      'chemisch_afval': 'pi-exclamation-triangle',
      'gemengd_afval': 'pi-trash',
      'niet_classificeerbaar': 'pi-question-circle'
    };
    return icons[afvalType] || 'pi-trash';
  }

  private getDefaultAfvalType(): AfvalType {
    return {
      id: 'niet_classificeerbaar',
      naam: 'Niet classificeerbaar',
      beschrijving: 'Gemini kon het afval niet classificeren',
      kleur: '#9CA3AF',
      icoon: 'pi-question-circle'
    };
  }

  private getErrorFallback(): DetectieResultaat {
    const fallback = this.config.getFallbackResponse('error');
    return this.convertToDetectieResultaat(fallback);
  }

  private getValidationFallback(): DetectieResultaat {
    const fallback = this.config.getFallbackResponse('validation_fallback');
    return this.convertToDetectieResultaat(fallback);
  }

  private getStructureFallback(): DetectieResultaat {
    const fallback = this.config.getFallbackResponse('no_response');
    return this.convertToDetectieResultaat(fallback);
  }

  private getParsingFallback(): DetectieResultaat {
    const fallback = this.config.getFallbackResponse('error');
    return this.convertToDetectieResultaat(fallback);
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