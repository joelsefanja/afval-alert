import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { StepBuilderService } from '../../services';

@Component({
  selector: 'app-start-stap',
  standalone: true,
  imports: [ButtonModule, CardModule],
  templateUrl: './start-stap.component.html'
})
export class StartStapComponent {
  private stepBuilder: StepBuilderService = inject(StepBuilderService);
  
  start() {
    this.stepBuilder.next();
  }
}