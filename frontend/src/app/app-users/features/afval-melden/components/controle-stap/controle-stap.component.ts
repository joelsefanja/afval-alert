import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ControleStapService } from '../../services/procedure/controle-stap.service';

@Component({
  selector: 'app-controle-stap',
  standalone: true,
  imports: [ButtonModule, CardModule],
  templateUrl: './controle-stap.component.html'
})
export class ControleStapComponent {
  private controleService: ControleStapService = inject(ControleStapService);

  readonly overzicht = this.controleService.overzicht;
  readonly isComplete = this.controleService.isComplete;

  prev() {
    this.controleService.prev();
  }

  submit() {
    this.controleService.submit();
  }

  editFoto() {
    this.controleService.editFoto();
  }

  editLocatie() {
    this.controleService.editLocatie();
  }

  editContact() {
    this.controleService.editContact();
  }
}