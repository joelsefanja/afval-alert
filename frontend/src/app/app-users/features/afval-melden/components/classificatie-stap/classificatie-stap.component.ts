import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { Subscription } from 'rxjs';
import { MeldingsProcedureStatus } from '../../services/melding/melding-state.service';
import { FotoVerwerkingGeminiService } from '../../services/media/foto-verwerking-gemini.service';
import { MeldingConcept, MeldingConceptStatus } from '../../../../../models/melding-concept';

@Component({
  selector: 'app-classificatie-stap',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, ProgressSpinnerModule, MessageModule],
  templateUrl: './classificatie-stap.component.html',
})
export class ClassificatieStapComponent implements OnInit, OnDestroy {
  protected state = inject(MeldingsProcedureStatus);
  private fotoVerwerkingService = inject(FotoVerwerkingGeminiService);
  
  private subscription = new Subscription();
  protected verwerkingsFase = 'uploaden'; // 'uploaden', 'analyseren', 'voltooid', 'fout'
  protected foutmelding = '';

  ngOnInit() {
    this.startFotoVerwerking();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private async startFotoVerwerking() {
    try {
      // Converteer foto URL naar Blob
      const fotoUrl = this.state.fotoUrl();
      if (!fotoUrl) {
        throw new Error('Geen foto beschikbaar');
      }

      const blob = await this.urlNaarBlob(fotoUrl);
      
      // Start verwerking
      this.verwerkingsFase = 'analyseren';
      
      this.subscription.add(
        this.fotoVerwerkingService.verwerkFoto(blob).subscribe({
          next: (response) => {
            // Maak melding concept aan
            const concept: MeldingConcept = {
              id: this.generateMeldingId(),
              afbeeldingUrl: fotoUrl,
              afvalTypes: response.afvalTypes,
              weetje: response.weetje,
              status: MeldingConceptStatus.AFBEELDING_VERWERKT,
              aanmaakDatum: new Date()
            };

            this.verwerkingsFase = 'voltooid';
            
            // Wacht even voor UX en ga dan naar volgende stap
            setTimeout(() => {
              this.state.voltooiFotoVerwerking(concept);
            }, 1500);
          },
          error: (error) => {
            this.verwerkingsFase = 'fout';
            this.foutmelding = error.message || 'Er ging iets mis bij het verwerken van de foto';
          }
        })
      );
    } catch (error) {
      this.verwerkingsFase = 'fout';
      this.foutmelding = 'Foto kon niet worden gelezen';
    }
  }

  private async urlNaarBlob(url: string): Promise<Blob> {
    const response = await fetch(url);
    return response.blob();
  }

  probeerOpnieuw() {
    this.verwerkingsFase = 'uploaden';
    this.foutmelding = '';
    this.startFotoVerwerking();
  }

  terugNaarFoto() {
    this.state.setHuidigeStap(1); // Terug naar foto stap
  }

  private generateMeldingId(): string {
    return 'melding_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
  }
}