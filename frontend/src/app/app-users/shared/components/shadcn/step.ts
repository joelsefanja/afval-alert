import { Component, input, signal, computed } from '@angular/core';
import { cn } from '@app/app-users/shared/utils/cn';

@Component({
  selector: 'ui-step',
  standalone: true,
  template: `
    <div [class]="stepClasses()">
      <ng-content></ng-content>
    </div>
  `,
})
export class StepComponent {
  stepId = input<string>('');
  className = input<string>('');
  
  isActive = signal(false);
  
  readonly stepClasses = computed(() => 
    cn(
      'transition-opacity duration-300',
      this.isActive() ? 'block opacity-100' : 'hidden opacity-0',
      this.className()
    )
  );
  
  /**
   * Stelt de actieve status van deze stap in
   * @param active Of de stap actief is
   */
  setActive(active: boolean): void {
    this.isActive.set(active);
  }
}