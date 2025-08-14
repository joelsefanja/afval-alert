import { Component, inject, input } from '@angular/core';
import { MeldingsProcedureStatus } from '../services/melding/melding-state.service';
import { FotoService } from '../services/media/foto.service';
import { LocatieService } from '../services/locatie/locatie.service';
import { MeldingVerzendService } from '../services/melding/melding-verzend.service';

@Component({
  template: `
    <div class="max-w-md mx-auto px-4 py-6 space-y-6">
      @if (toonTerug()) {
        <button class="text-sm text-muted-foreground hover:text-foreground" (click)="terug()">← Terug</button>
      }
      <div>
        <h1 class="text-2xl font-bold">{{ titel() }}</h1>
        <div class="bg-muted/50 p-4 rounded-lg mt-4">
          <p class="text-sm text-muted-foreground">{{ subtitel() }}</p>
        </div>
      </div>
      <ng-content></ng-content>
    </div>
  `,
  standalone: true
})
export abstract class BaseStapComponent {
  protected state = inject(MeldingsProcedureStatus);
  protected foto = inject(FotoService);
  protected locatie = inject(LocatieService);
  protected verzend = inject(MeldingVerzendService);
  
  titel = input.required<string>();
  subtitel = input.required<string>();
  toonTerug = input(true);
  
  terug() { this.state.gaTerugNaarVorige(); }
  volgende() { this.state.gaNaarVolgende(); }
}