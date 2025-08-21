import { Component, input, computed } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';

interface AfvalType {
  type: string;
  confidence: number;
}

/**
 * Micro-component voor AI classificatie resultaten
 * Toont wat de AI heeft gedetecteerd in de foto
 */
@Component({
  selector: 'app-classificatie-resultaat',
  standalone: true,
  imports: [CardModule, TagModule, ProgressBarModule],
  templateUrl: './classificatie-resultaat.component.html'
})
export class ClassificatieResultaatComponent {
  // Input signals
  readonly resultaten = input<AfvalType[]>([]);
  readonly isGeladen = input(true);
  
  // Computed signals
  readonly heeftResultaten = computed(() => this.resultaten().length > 0);
  readonly besteGok = computed(() => {
    const data = this.resultaten();
    if (!data.length) return null;
    return data.reduce((prev, current) => 
      current.confidence > prev.confidence ? current : prev
    );
  });
  
  readonly gesorteerdeResultaten = computed(() => {
    return [...this.resultaten()].sort((a, b) => b.confidence - a.confidence);
  });
  
  readonly betrouwbaarheidsKleur = computed(() => {
    const beste = this.besteGok();
    if (!beste) return 'secondary';
    
    if (beste.confidence >= 0.8) return 'success';
    if (beste.confidence >= 0.6) return 'warning';
    return 'danger';
  });
  
  getConfidencePercentage(confidence: number): number {
    return Math.round(confidence * 100);
  }
  
  getConfidenceSeverity(confidence: number): 'success' | 'warning' | 'danger' {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'danger';
  }
}