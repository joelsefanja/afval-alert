import { Component, inject } from '@angular/core';
import { NavigatieService } from '../../services/navigatie/navigatie.service';
import { IntroStapService } from '../../services/stappen/intro/intro-stap.service';
import { NavigatieKnoppenComponent } from '../shared/navigatie-knoppen/navigatie-knoppen.component';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';

/**
 * Introductie stap component
 * Welkomst scherm met start knop
 */
@Component({
  selector: 'app-introductie-stap',
  standalone: true,
  imports: [
    CardModule,
    ButtonModule,
    AvatarModule,
    TagModule
  ],
  templateUrl: './introductie-stap.component.html',
  // Geen styleUrls meer nodig omdat we PrimeNG componenten gebruiken
})
export class IntroductieStapComponent {
  // Services
  private readonly navigatie = inject(NavigatieService);
  private readonly introStap = inject(IntroStapService);

  onStarten(): void {
    this.introStap.startMelding();
    this.navigatie.volgende();
  }
  
  onVolgende(): void {
    this.onStarten();
  }
}