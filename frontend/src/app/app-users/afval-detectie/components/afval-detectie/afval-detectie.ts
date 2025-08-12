import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { FotoOpnameComponent } from '../foto-opname/foto-opname';
import { AfvalType } from '../../../../models/afval-type.model';

@Component({
  selector: 'app-afval-detectie',
  standalone: true,
  imports: [
    CommonModule, 
    FotoOpnameComponent,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './afval-detectie.html',
  styleUrl: './afval-detectie.scss'
})
export class AfvalDetectieComponent {
  private huidigeFoto = signal<Blob | null>(null);
  private gedetecteerdAfval = signal<AfvalType[]>([]);
  
  readonly heeftFoto = computed(() => !!this.huidigeFoto());
  readonly heeftAfvalSoorten = computed(() => this.gedetecteerdAfval().length > 0);
  readonly afvalSoorten = computed(() => this.gedetecteerdAfval());
  readonly kanMelden = computed(() => this.heeftFoto() && this.heeftAfvalSoorten());
  
  verwerkGemaakteFoto(foto: Blob): void {
    this.huidigeFoto.set(foto);
  }
  
  verwerkAfvalHerkenning(afvalSoorten: AfvalType[]): void {
    this.gedetecteerdAfval.set(afvalSoorten);
  }
  
  meldAfval(): void {
    if (this.kanMelden()) {
      console.log('Afval melden:', {
        foto: this.huidigeFoto(),
        afvalSoorten: this.gedetecteerdAfval()
      });
    }
  }
  
  resetAlles(): void {
    this.huidigeFoto.set(null);
    this.gedetecteerdAfval.set([]);
  }
}