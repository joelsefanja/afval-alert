import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ImageModule } from 'primeng/image';
import { TagModule } from 'primeng/tag';
import { ControleStapService } from '@services/proces/stappen';
import { MeldingStateService } from '@services/melding/state/melding-state.service';
import { AfvalTypeDetectie } from '@app/app-users/features/afval-melden/interfaces/gemini-response.interface';

@Component({
  selector: 'app-controle-stap',
  standalone: true,
  imports: [ButtonModule, CardModule, ImageModule, TagModule],
  templateUrl: './controle-stap.component.html'
})
export class ControleStapComponent {
  private controleService: ControleStapService = inject(ControleStapService);
  private meldingState: MeldingStateService = inject(MeldingStateService);

  readonly overzicht = this.controleService.overzicht;
  readonly isComplete = this.controleService.isComplete;
  readonly meldingData = this.meldingState.meldingData;

  get gedetecteerdeAfvalTypes() {
    return this.meldingData()?.fotoHerkenningResultaat?.afvalTypes ?? [];
  }

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

  getAfvalTypeText(type: AfvalTypeDetectie): string {
    // For now, we'll just show the name since we don't have confidence data
    return type.afval_type;
  }

  getAfvalTypeSeverity(type: AfvalTypeDetectie): string {
    // Default to secondary since we don't have confidence data
    return 'secondary';
  }

  isAnoniemeContact(): boolean {
    // Type assertion to handle the missing 'anoniem' property
    const contact: any = this.meldingData().contact;
    return !!contact?.anoniem;
  }

  getContactNaam(): string {
    // Type assertion to handle the missing 'naam' property
    const contact: any = this.meldingData().contact;
    return contact?.naam || 'Geen naam';
  }
}