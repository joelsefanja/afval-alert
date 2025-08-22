import { Component, input, output, computed } from '@angular/core';
import { ButtonModule } from 'primeng/button';

/**
 * Gedeelde navigatie knoppen component
 * Herbruikbaar voor alle stappen met configureerbare labels
 */
@Component({
  selector: 'app-navigatie-knoppen',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './navigatie-knoppen.component.html'
})
export class NavigatieKnoppenComponent {
  // Input signals voor vorige knop
  readonly toonVorigeKnop = input(true);
  readonly vorigeLabel = input('Vorige');
  readonly vorigeUitgeschakeld = input(false);
  
  // Input signals voor volgende knop
  readonly toonVolgendeKnop = input(true);
  readonly volgendeLabel = input('Volgende');
  readonly volgendeIcon = input('pi pi-chevron-right');
  readonly volgendeIconPositie = input<'left' | 'right'>('right');
  readonly volgendeUitgeschakeld = input(false);
  readonly volgendeSeverity = input<'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger'>('primary');
  
  // Output signals
  readonly vorige = output<void>();
  readonly volgende = output<void>();
  
  // Computed signals
  readonly volgendeButtonClass = computed(() => {
    const baseClass = 'flex items-center justify-center gap-2 transition-all font-medium min-h-12 px-4 py-3 rounded-lg text-sm disabled:opacity-50';
    const flexClass = this.toonVorigeKnop() ? 'flex-1' : 'w-full';
    
    const severityClasses = {
      primary: 'bg-primary hover:bg-primary-600 disabled:bg-primary-300 text-white',
      secondary: 'bg-surface-200 hover:bg-surface-300 disabled:bg-surface-100 text-surface-700',
      success: 'bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white',
      info: 'bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white',
      warn: 'bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white',
      danger: 'bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white'
    };
    
    return `${baseClass} ${flexClass} ${severityClasses[this.volgendeSeverity()]}`;
  });
  
  onVorige(): void {
    if (!this.vorigeUitgeschakeld()) {
      this.vorige.emit();
    }
  }
  
  onVolgende(): void {
    if (!this.volgendeUitgeschakeld()) {
      this.volgende.emit();
    }
  }
}