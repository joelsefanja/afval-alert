import { Component, ContentChildren, QueryList, AfterContentInit, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StepComponent } from '../step/step.component';

@Component({
  selector: 'ui-multi-step-form',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="multi-step-form">
      <!-- Voortgangsindicator -->
      @if (showProgress() && !isLastStep()) {
        <div class="progress-container mb-6">
          <div class="flex items-center justify-center space-x-2 overflow-x-auto">
            @for (step of steps(); track $index; let i = $index; let last = $last) {
              <div class="flex items-center flex-shrink-0">
                <div 
                  [class]="currentStepIndex() === i ? 'w-3 h-3 bg-primary rounded-full' : 
                    (i < currentStepIndex() ? 'w-3 h-3 bg-primary-300 rounded-full' : 'w-3 h-3 bg-gray-300 rounded-full')"
                ></div>
                <span class="ml-1 text-xs md:text-sm text-gray-600 whitespace-nowrap">{{ stepLabels()[i] || 'Stap ' + (i + 1) }}</span>
              </div>
              @if (!last) {
                <div class="w-8 h-0.5 bg-gray-300 flex-shrink-0"></div>
              }
            }
          </div>
          @if (showStepCount()) {
            <div class="text-center text-sm text-gray-500 mt-2">
              Stap {{ currentStepIndex() + 1 }} van {{ steps().length }}
            </div>
          }
        </div>
      }

      <!-- Inhoud van de stap -->
      <div class="step-content">
        <ng-content></ng-content>
      </div>

      <!-- Navigatieknoppen -->
      @if (showNavigation() && !isLastStep()) {
        <div class="navigation-buttons mt-6 flex justify-between">
          @if (currentStepIndex() > 0) {
            <button 
              (click)="previousStep()"
              class="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
            >
              Terug
            </button>
          }
          @if (currentStepIndex() === 0) {
            <div class="flex-1"></div>
          }
          @if (!isLastStep()) {
            <button 
              (click)="nextStep()"
              [disabled]="!canProceed()"
              [class]="canProceed() ? 'px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors' : 
                'px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed'"
            >
              {{ nextButtonText() }}
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .multi-step-form {
      display: flex;
      flex-direction: column;
      width: 100%;
    }
    
    .progress-container {
      width: 100%;
    }
    
    .step-content {
      width: 100%;
    }
  `]
})
export class MultiStepFormComponent implements AfterContentInit {
  @ContentChildren(StepComponent) stepComponents!: QueryList<StepComponent>;
  
  // Inputs als signals
  currentStepIndex = input<number>(0);
  stepLabels = input<string[]>([]);
  showProgress = input<boolean>(true);
  showStepCount = input<boolean>(true);
  showNavigation = input<boolean>(true);
  canProceed = input<boolean>(true);
  nextButtonText = input<string>('Verder');
  
  // Output als signal
  stepChange = output<number>();
  
  // Interne state
  steps = signal<StepComponent[]>([]);
  
  // Computed voor het bepalen of we op de laatste stap zijn
  readonly isLastStep = computed(() => {
    return this.currentStepIndex() === this.steps().length - 1;
  });
  
  ngAfterContentInit() {
    this.steps.set(this.stepComponents.toArray());
    this.updateActiveStep();
    
    this.stepComponents.changes.subscribe(() => {
      this.steps.set(this.stepComponents.toArray());
      this.updateActiveStep();
    });
  }
  
  nextStep() {
    if (this.canProceed() && this.currentStepIndex() < this.steps().length - 1) {
      const newIndex = this.currentStepIndex() + 1;
      this.stepChange.emit(newIndex);
    }
  }
  
  previousStep() {
    if (this.currentStepIndex() > 0) {
      const newIndex = this.currentStepIndex() - 1;
      this.stepChange.emit(newIndex);
    }
  }
  
  goToStep(index: number) {
    if (index >= 0 && index < this.steps().length) {
      this.stepChange.emit(index);
    }
  }
  
  private updateActiveStep() {
    const currentIndex = this.currentStepIndex();
    const stepList = this.steps();
    
    stepList.forEach((step, index) => {
      step.setActive(index === currentIndex);
    });
  }
}