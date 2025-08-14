import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { Subscription } from 'rxjs';
import { MeldingsProcedureStatus } from '../../services/melding/melding-state.service';
import { IAfvalHerkenningService, AFVAL_HERKENNING_SERVICE_TOKEN } from '../../interfaces/afval-herkenning.interface';
import { MeldingConcept, MeldingConceptStatus } from '../../../../../models/melding-concept';

@Component({
  selector: 'app-foto-verwerking',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, ProgressSpinnerModule, MessageModule],
  templateUrl: './foto-verwerking.component.html',
  styleUrls: ['./foto-verwerking.component.scss']
})
export class FotoVerwerkingComponent implements OnInit, OnDestroy {
  protected state = inject(MeldingsProcedureStatus);
  private afvalHerkenningService: IAfvalHerkenningService = inject(AFVAL_HERKENNING_SERVICE_TOKEN);
  
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
      
      const uploadRequest = { afbeelding: blob };
      
      this.subscription.add(
        this.afvalHerkenningService.uploadEnHerkenAfbeelding(uploadRequest).subscribe({
          next: (response) => {
            // Maak melding concept aan
            const concept: MeldingConcept = {
              id: response.meldingId,
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
}