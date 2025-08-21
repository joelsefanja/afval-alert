import { Component, input, output, signal, computed } from '@angular/core';
import { SharedKaartComponent } from '@app/shared/components/kaart/shared-kaart.component';


/**
 * Container component voor de kaart weergave
 * Toont kaart met loading state en geselecteerde locatie
 */
@Component({
  selector: 'app-kaart-container',
  standalone: true,
  imports: [SharedKaartComponent],
  templateUrl: './kaart-container.component.html'
})
export class KaartContainerComponent {
  readonly geselecteerdeLocatie = input<any>(null);
  readonly isGeladen = input(false);
  
  readonly locatieGeselecteerd = output<any>();
  
  private readonly laadStatus = signal<string>('Kaart wordt geladen...');
  
  readonly toonKaart = computed(() => this.isGeladen());
  readonly laadTekst = computed(() => this.laadStatus());
  
  onLocatieGeselecteerd(locatie: any): void {
    this.locatieGeselecteerd.emit(locatie);
  }
  
  onKaartGeladen(): void {
    this.laadStatus.set('Kaart geladen');
  }
  
  zetLaadStatus(status: string): void {
    this.laadStatus.set(status);
  }
}