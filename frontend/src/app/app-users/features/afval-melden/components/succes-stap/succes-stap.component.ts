import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SuccesStapService } from '../../services/procedure/succes-stap.service';

@Component({
  selector: 'app-succes-stap',
  standalone: true,
  imports: [ButtonModule, CardModule],
  templateUrl: './succes-stap.component.html'
})
export class SuccesStapComponent {
  private succesService: SuccesStapService = inject(SuccesStapService);

  readonly canInstallPWA = this.succesService.canInstallPWA;
  readonly isInstalled = this.succesService.isInstalled;

  async downloadApp() {
    await this.succesService.promptPWAInstall();
  }

  newReport() {
    this.succesService.resetAndStart();
  }

  closeApp() {
    this.succesService.closeApp();
  }
}