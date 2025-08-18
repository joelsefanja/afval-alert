import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { IAfvalHerkenningService } from '../../interfaces/afval-herkenning.interface';
import { AfbeeldingUploadRequest, AfbeeldingUploadResponse, AfvalType } from '../../../../../models/afval-herkenning';

@Injectable({
  providedIn: 'root'
})
export class AfvalHerkenningMockService implements IAfvalHerkenningService {

  private readonly mockAfvalTypes: AfvalType[] = [
    {
      id: 'plastic-fles',
      naam: 'Plastic fles',
      beschrijving: 'PET plastic drankfles',
      kleur: '#3B82F6',
      icoon: 'pi-circle'
    },
    {
      id: 'blik',
      naam: 'Blikje',
      beschrijving: 'Aluminium drankblikje',
      kleur: '#10B981',
      icoon: 'pi-circle'
    },
    {
      id: 'papier',
      naam: 'Papier',
      beschrijving: 'Papieren verpakking',
      kleur: '#F59E0B',
      icoon: 'pi-file'
    },
    {
      id: 'glas',
      naam: 'Glas',
      beschrijving: 'Glazen fles of pot',
      kleur: '#8B5CF6',
      icoon: 'pi-circle'
    },
    {
      id: 'restafval',
      naam: 'Restafval',
      beschrijving: 'Overig afval',
      kleur: '#6B7280',
      icoon: 'pi-trash'
    }
  ];

  private readonly weetjes: string[] = [
    'Wist je dat een plastic fles tot 450 jaar kan duren om af te breken in de natuur?',
    'Een aluminium blikje kan oneindig vaak gerecycled worden zonder kwaliteitsverlies!',
    'Papier recyclen bespaart 60% energie vergeleken met nieuw papier maken.',
    'Glas kan 100% gerecycled worden en verliest nooit zijn kwaliteit.',
    'Door afval te scheiden kunnen we tot 75% van ons huishoudelijk afval recyclen.',
    'Het recyclen van één ton papier bespaart 17 bomen!',
    'Plastic recyclen gebruikt 88% minder energie dan nieuw plastic maken.',
    'Nederland recyclet ongeveer 85% van al het glas dat wordt weggegooid.'
  ];

  uploadEnHerkenAfbeelding(request: AfbeeldingUploadRequest): Observable<AfbeeldingUploadResponse> {
    // Simuleer netwerk vertraging
    const verwerkingsTijd = Math.random() * 2000 + 1000; // 1-3 seconden
    
    // Simuleer soms een fout
    if (Math.random() < 0.05) { // 5% kans op fout
      return throwError(() => new Error('AI service tijdelijk niet beschikbaar')).pipe(
        delay(verwerkingsTijd)
      );
    }

    // Genereer mock response
    const aantalTypes = Math.floor(Math.random() * 3) + 1; // 1-3 afval types
    const geselecteerdeTypes = this.selecteerRandomAfvalTypes(aantalTypes);
    const randomWeetje = this.weetjes[Math.floor(Math.random() * this.weetjes.length)];
    
    const response: AfbeeldingUploadResponse = {
      meldingId: this.generateMeldingId(),
      afvalTypes: geselecteerdeTypes,
      weetje: randomWeetje
    };

    return of(response).pipe(delay(verwerkingsTijd));
  }

  isServiceBeschikbaar(): Observable<boolean> {
    // Simuleer service status check
    return of(Math.random() > 0.1).pipe(delay(500)); // 90% uptime
  }

  private selecteerRandomAfvalTypes(aantal: number): AfvalType[] {
    const shuffled = [...this.mockAfvalTypes].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, aantal);
  }

  private generateMeldingId(): string {
    return 'melding-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
}