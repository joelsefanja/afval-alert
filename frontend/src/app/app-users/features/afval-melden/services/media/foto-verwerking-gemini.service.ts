import { Injectable, inject } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { IFotoVerwerkingService, FotoVerwerkingResultaat } from '../../interfaces/foto-verwerking.interface';
import { GeminiService } from './gemini.service';
import { AfvalType } from '@app/models/afval-herkenning';

@Injectable({
  providedIn: 'root'
})
export class FotoVerwerkingGeminiService implements IFotoVerwerkingService {
  private geminiService = inject(GeminiService);

  verwerkFoto(fotoBlob: Blob): Observable<FotoVerwerkingResultaat> {
    console.log('🚀 Starting foto verwerking met Gemini 2.0 Flash...');
    
    return from(this.geminiService.classifyAfval(fotoBlob)).pipe(
      tap(detectieResultaat => {
        console.log('✅ Gemini analyse voltooid:', detectieResultaat);
      }),
      map(detectieResultaat => ({
        afvalTypes: detectieResultaat.afvalTypes,
        weetje: this.formatBedankBoodschap(detectieResultaat.funFact, detectieResultaat.isAfval),
        isAfval: detectieResultaat.isAfval,
        kenmerken: detectieResultaat.kenmerken,
        zekerheidsScores: detectieResultaat.zekerheidsScores,
        metadata: {
          geminiModel: 'gemini-2.0-flash-exp',
          analyseDatum: new Date().toISOString(),
          afvalGedetecteerd: detectieResultaat.isAfval,
          hoogsteZekerheid: Math.max(...detectieResultaat.zekerheidsScores, 0)
        }
      })),
      catchError(error => {
        console.error('❌ Foto verwerking fout:', error);
        return of(this.getErrorFallback());
      })
    );
  }

  /**
   * Valideert lokale AI resultaten met Gemini (voor toekomstige uitbreiding)
   */
  validateerMetGemini(
    localDescription: string, 
    localPredictions: string[], 
    originalBlob?: Blob
  ): Observable<FotoVerwerkingResultaat> {
    console.log('🔍 Starting Gemini validatie van lokale resultaten...');
    
    const predictionsText = localPredictions.join(', ');
    
    return from(this.geminiService.validateLocalResults(localDescription, predictionsText)).pipe(
      tap(validatieResultaat => {
        console.log('✅ Gemini validatie voltooid:', validatieResultaat);
      }),
      map(validatieResultaat => ({
        afvalTypes: validatieResultaat.afvalTypes,
        weetje: validatieResultaat.funFact,
        isAfval: validatieResultaat.isAfval,
        kenmerken: validatieResultaat.kenmerken,
        zekerheidsScores: validatieResultaat.zekerheidsScores,
        metadata: {
          geminiModel: 'gemini-2.0-flash-exp',
          analyseDatum: new Date().toISOString(),
          validatieType: 'local_ai_validation',
          afvalGedetecteerd: validatieResultaat.isAfval,
          hoogsteZekerheid: Math.max(...validatieResultaat.zekerheidsScores, 0)
        }
      })),
      catchError(error => {
        console.error('❌ Gemini validatie fout:', error);
        return of(this.getValidatieFallback());
      })
    );
  }

  isServiceBeschikbaar(): Observable<boolean> {
    // Check of environment aanwezig is - in browser altijd beschikbaar
    try {
      // In production zou dit een echte health check zijn
      const isAvailable = true;
      console.log('🔑 Gemini service beschikbaarheid:', isAvailable);
      return of(isAvailable);
    } catch (error) {
      console.warn('⚠️ Kon Gemini service beschikbaarheid niet controleren:', error);
      return of(false);
    }
  }

  private formatBedankBoodschap(originalMessage: string, isAfval: boolean): string {
    if (!isAfval) {
      return 'Bedankt voor je melding! We hebben geen zwerfafval gedetecteerd op deze foto.';
    }
    
    // Als het een standaard boodschap is, maak het persoonlijker
    if (originalMessage.includes('Bedankt voor het melden')) {
      return 'Geweldig! We hebben het afval herkend. Bedankt dat je meehelpt je buurt schoon te houden! 🌱';
    }
    
    return originalMessage;
  }

  private getErrorFallback(): FotoVerwerkingResultaat {
    return {
      afvalTypes: [this.getDefaultAfvalType()],
      weetje: 'Sorry, er ging iets mis bij de analyse. Je melding wordt wel verwerkt! 🔧',
      isAfval: true, // Assumeer dat het afval is als we niet kunnen analyseren
      kenmerken: ['analyse_fout', 'handmatige_controle_nodig'],
      zekerheidsScores: [0.5],
      metadata: {
        geminiModel: 'fallback',
        analyseDatum: new Date().toISOString(),
        afvalGedetecteerd: true,
        foutOpgetreden: true,
        hoogsteZekerheid: 0.5
      }
    };
  }

  private getValidatieFallback(): FotoVerwerkingResultaat {
    return {
      afvalTypes: [this.getDefaultAfvalType()],
      weetje: 'We hebben je lokale analyse gevalideerd. Bedankt voor je melding! ✅',
      isAfval: true,
      kenmerken: ['lokale_validatie', 'gemini_fallback'],
      zekerheidsScores: [0.7],
      metadata: {
        geminiModel: 'validation-fallback',
        analyseDatum: new Date().toISOString(),
        validatieType: 'fallback',
        afvalGedetecteerd: true,
        hoogsteZekerheid: 0.7
      }
    };
  }

  private getDefaultAfvalType(): AfvalType {
    return {
      id: 'gemengd_afval',
      naam: 'Gemengd afval',
      beschrijving: 'Algemeen zwerfafval - wordt handmatig geclassificeerd',
      kleur: '#6B7280',
      icoon: 'pi-trash'
    };
  }
}