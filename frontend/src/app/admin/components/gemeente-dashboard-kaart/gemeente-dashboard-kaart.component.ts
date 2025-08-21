import { Component, input, output, signal, computed } from '@angular/core';
import { SharedKaartComponent } from '../../../shared/components/kaart/shared-kaart.component';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Button } from 'primeng/button';
import { TagModule } from 'primeng/tag';

interface AfvalMelding {
  id: string;
  latitude: number;
  longitude: number;
  status: 'nieuw' | 'bezig' | 'opgelost';
  type: string;
  adres?: string;
  datum: Date;
}

/**
 * Gemeente dashboard kaart component
 * Toont alle afvalmeldingen op een kaart voor gemeente medewerkers
 * Gebruikt shared kaart component met multi-marker support
 */
@Component({
  selector: 'app-gemeente-dashboard-kaart',
  standalone: true,
  imports: [SharedKaartComponent, CardModule, ButtonModule, TagModule],
  templateUrl: './gemeente-dashboard-kaart.component.html'
})
export class GemeenteDashboardKaartComponent {
  readonly meldingen = input<AfvalMelding[]>([]);
  readonly geselecteerdeMelding = input<AfvalMelding | null>(null);
  readonly filterStatus = input<'alle' | 'nieuw' | 'bezig' | 'opgelost'>('alle');
  
  // Output signals
  readonly meldingGeselecteerd = output<AfvalMelding>();
  readonly statusGewijzigd = output<{melding: AfvalMelding, nieuweStatus: 'nieuw' | 'bezig' | 'opgelost'}>();
  
  // Local state
  readonly toonDetails = signal(true);
  
  // Computed signals
  readonly gefilterdeMeldingen = computed(() => {
    const status = this.filterStatus();
    const meldingen = this.meldingen();
    
    if (status === 'alle') return meldingen;
    return meldingen.filter(m => m.status === status);
  });
  
  readonly kaartLocaties = computed(() => {
    return this.gefilterdeMeldingen().map(melding => ({
      id: melding.id,
      latitude: melding.latitude,
      longitude: melding.longitude,
      status: melding.status,
      type: melding.type
    }));
  });
  
  readonly geselecteerdeKaartLocatie = computed(() => {
    const melding = this.geselecteerdeMelding();
    if (!melding) return null;
    
    return {
      id: melding.id,
      latitude: melding.latitude,
      longitude: melding.longitude,
      status: melding.status,
      type: melding.type
    };
  });
  
  readonly statusStats = computed(() => {
    const meldingen = this.meldingen();
    return {
      nieuw: meldingen.filter(m => m.status === 'nieuw').length,
      bezig: meldingen.filter(m => m.status === 'bezig').length,
      opgelost: meldingen.filter(m => m.status === 'opgelost').length,
      totaal: meldingen.length
    };
  });
  
  // Event handlers
  onKaartLocatieGeselecteerd(locatie: any): void {
    const melding = this.meldingen().find(m => m.id === locatie.id);
    if (melding) {
      this.meldingGeselecteerd.emit(melding);
    }
  }
  
  onStatusWijzigen(melding: AfvalMelding, nieuweStatus: 'nieuw' | 'bezig' | 'opgelost'): void {
    this.statusGewijzigd.emit({ melding, nieuweStatus });
  }
  
  toggleDetails(): void {
    this.toonDetails.update(current => !current);
  }
  
  getStatusSeverity(status: string): 'danger' | 'warn' | 'success' {
    switch (status) {
      case 'nieuw': return 'danger';
      case 'bezig': return 'warn';
      case 'opgelost': return 'success';
      default: return 'danger';
    }
  }
  
  formatDatum(datum: Date): string {
    return new Intl.DateTimeFormat('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(datum);
  }
}