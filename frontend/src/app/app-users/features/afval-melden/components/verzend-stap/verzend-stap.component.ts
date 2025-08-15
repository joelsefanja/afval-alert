import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { Subscription } from 'rxjs';
import { MeldingsProcedureStatus } from '../../services/melding/melding-state.service';
import { IMeldingService } from '../../interfaces/melding.interface';
import { MeldingMockService } from '../../services/melding/melding-mock.service';
import { MeldingVerzendRequest } from '../../../../../models/afval-herkenning';

@Component({
  selector: 'app-verzend-stap',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, ProgressSpinnerModule, MessageModule],
  templateUrl: './verzend-stap.component.html',
  styleUrls: ['./verzend-stap.component.scss']
})
export class VerzendStapComponent implements OnInit, OnDestroy {
  protected state = inject(MeldingsProcedureStatus);
  private meldingService: IMeldingService = inject(MeldingMockService);
  
  private subscription = new Subscription();
  protected verzendStatus = 'verzenden'; // 'verzenden', 'succes', 'fout'
  protected foutmelding = '';

  ngOnInit() {
    this.startVerzenden();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private startVerzenden() {
    const concept = this.state.meldingConcept();
    const locatie = this.state.locatieCoordinaten();
    
    if (!concept || !locatie) {
      this.verzendStatus = 'fout';
      this.foutmelding = 'Ontbrekende gegevens voor verzending';
      return;
    }

    const verzendRequest: MeldingVerzendRequest = {
      meldingId: concept.id,
      locatie: {
        latitude: locatie.lat,
        longitude: locatie.lng
      },
      contact: concept.contact
    };

    this.state.setVerzenden(true);

    this.subscription.add(
      this.meldingService.verzendMelding(verzendRequest).subscribe({
        next: (response) => {
          if (response.success) {
            this.verzendStatus = 'succes';
            this.state.setVerzenden(false);
            
            // Wacht even voor UX en ga dan naar succes stap
            setTimeout(() => {
              this.state.setHuidigeStap(7); // Succes stap
            }, 1500);
          } else {
            this.verzendStatus = 'fout';
            this.foutmelding = 'Melding kon niet worden verzonden';
            this.state.setVerzenden(false);
          }
        },
        error: (error) => {
          this.verzendStatus = 'fout';
          this.foutmelding = error.message || 'Er ging iets mis bij het verzenden';
          this.state.setVerzendError(this.foutmelding);
        }
      })
    );
  }

  probeerOpnieuw() {
    this.verzendStatus = 'verzenden';
    this.foutmelding = '';
    this.state.setVerzendError('');
    this.startVerzenden();
  }

  terugNaarControle() {
    this.state.setHuidigeStap(5); // Terug naar controle stap
  }
}