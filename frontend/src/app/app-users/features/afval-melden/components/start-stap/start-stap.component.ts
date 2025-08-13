import { Component, inject } from '@angular/core';
import { ButtonComponent, CardComponent, CardContentComponent, CardHeaderComponent } from '@app/app-users/shared/components/shadcn';
import { MeldingState } from '../../services/melding-state.service';

@Component({
  selector: 'app-start-stap',
  standalone: true,
  imports: [ButtonComponent, CardComponent, CardHeaderComponent, CardContentComponent],
  templateUrl: './start-stap.component.html'
})
export class StartStapComponent {
  private stateService = inject(MeldingState);

  onStartMelding(): void {
    this.stateService.gaNaarVolgende();
  }
}
