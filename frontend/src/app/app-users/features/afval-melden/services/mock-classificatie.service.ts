import { Injectable, inject } from '@angular/core';
import { ClassificatieService } from './classificatie.service';
import { AfvalClassificatieResponse } from '../interfaces/afval-classificatie.interface';

/**
 * Service voor herkenning van afval
 * Verantwoordelijkheden:
 *  - Herkenning starten en resetten
 *  - Resultaat ophalen en formatteren
 *  - Foutmeldingen beheren
 */
@Injectable({ providedIn: 'root' })
export class AfvalHerkenningService {
  private echteService = inject(ClassificatieService);

  laatsteResultaat: AfvalClassificatieResponse | null = null;
  herkenningIsBezig = false;
  foutmelding: string | null = null;

  async startHerkenning(foto: Blob): Promise<AfvalClassificatieResponse | null> {
    if (this.herkenningIsBezig) throw new Error('Herkenning is al bezig.');
    this.herkenningIsBezig = true;
    this.foutmelding = null;

    try {
      const resultaat = await this.probeerEchteHerkenning(foto)
                        ?? await this.startMockHerkenning();
      this.laatsteResultaat = resultaat;
      return resultaat;
    } catch (error) {
      this.foutmelding = this.vertalingFoutmelding(error);
      return null;
    } finally {
      this.herkenningIsBezig = false;
    }
  }

  async startHerkenningOpnieuw(foto: Blob) {
    this.resetHerkenning();
    return this.startHerkenning(foto);
  }

  resetHerkenning() {
    this.laatsteResultaat = null;
    this.foutmelding = null;
  }

  krijgAfvalTypenAlsTekst(): string[] {
    if (!this.laatsteResultaat?.afval_typen.length) return [];
    return this.laatsteResultaat.afval_typen
      .map(t => `${t.type} (${Math.round(t.confidence * 100)}%)`);
  }

  krijgAfvalTypenGesorteerdOpScore(): Array<{type: string; score: number}> {
    if (!this.laatsteResultaat?.afval_typen.length) return [];
    return this.laatsteResultaat.afval_typen
      .map(t => ({ type: t.type, score: Math.round(t.confidence * 100) }))
      .sort((a, b) => b.score - a.score);
  }

  private async probeerEchteHerkenning(foto: Blob): Promise<AfvalClassificatieResponse | null> {
    try {
      return await this.echteService.classificeerAfval(foto);
    } catch {
      return null;
    }
  }

  private async startMockHerkenning(): Promise<AfvalClassificatieResponse> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const mock = [
      { type: 'Glas', confidence: 0.95 },
      { type: 'Plastic', confidence: 0.87 },
      { type: 'Restafval', confidence: 0.68 }
    ];
    const selectie = mock.slice(0, Math.floor(Math.random() * 3) + 1);
    return { afval_typen: selectie };
  }

  private vertalingFoutmelding(error: unknown): string {
    if (error instanceof Error) {
      if (error.message.includes('timeout')) return 'AI herkenning duurde te lang.';
      if (error.message.includes('network')) return 'Geen internetverbinding.';
      return error.message;
    }
    return 'Onbekende fout bij AI herkenning';
  }
}
