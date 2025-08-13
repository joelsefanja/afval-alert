import { Component, ContentChildren, QueryList, AfterContentInit, input, output, effect, signal } from '@angular/core';
import { cn } from '@app/app-users/shared/utils/cn';
import { StepComponent } from './step';

@Component({
  selector: 'ui-multi-step-form',
  standalone: true,
  template: `
    <div class="w-full">
      <!-- Progress indicator -->
      @if (showProgress()) {
        <div class="mb-6">
          <div class="relative">
            <!-- Progress bar -->
            <div class="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-gray-200 rounded-full">
              <div 
                class="h-full bg-primary rounded-full transition-all duration-300 motion-preset-slide-right" 
                [style.width.%]="progressPercentage()"
              ></div>
            </div>
            
            <!-- Step indicators -->
            <div class="relative flex justify-between">
              @for (label of stepLabels(); track $index) {
                <div class="flex flex-col items-center">
                  <div 
                    class="w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all duration-300"
                    [class]="getStepIndicatorClasses($index)"
                  >
                    @if ($index < currentStepIndex()) {
                      <span class="material-icons text-sm">check</span>
                    } @else {
                      {{ $index + 1 }}
                    }
                  </div>
                  @if (showStepLabels()) {
                    <span 
                      class="mt-2 text-xs font-medium transition-colors duration-300"
                      [class]="$index <= currentStepIndex() ? 'text-primary' : 'text-gray-500'"
                    >
                      {{ label }}
                    </span>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      }
      
      <!-- Step content -->
      <div class="relative overflow-hidden">
        <div class="transition-all duration-300 motion-preset-fade">
          <ng-content></ng-content>
        </div>
      </div>
      
      <!-- Navigation -->
      @if (showNavigation()) {
        <div class="mt-6 flex justify-between">
          <button 
            (click)="previousStep()"
            [disabled]="currentStepIndex() === 0"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Vorige
          </button>
          
          <button 
            (click)="nextStep()"
            [disabled]="!canProceed() || currentStepIndex() === steps().length - 1"
            class="px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ nextButtonText() }}
          </button>
        </div>
      }
      
      <!-- Step count -->
      @if (showStepCount()) {
        <div class="mt-4 text-center text-sm text-gray-500">
          Stap {{ currentStepIndex() + 1 }} van {{ steps().length }}
        </div>
      }
    </div>
  `,
})
export class MultiStepFormComponent implements AfterContentInit {
  // Inputs
  currentStepIndex = input<number>(0);
  stepLabels = input<string[]>([]);
  showProgress = input<boolean>(true);
  showStepLabels = input<boolean>(true);
  showStepCount = input<boolean>(true);
  showNavigation = input<boolean>(true);
  canProceed = input<boolean>(true);
  nextButtonText = input<string>('Volgende');
  
  // Outputs
  stepChange = output<number>();
  
  // Content children
  @ContentChildren(StepComponent) stepComponents!: QueryList<StepComponent>;
  
  // Internal state
  steps = signal<StepComponent[]>([]);
  progressPercentage = signal(0);
  
  constructor() {
    // Update progress percentage when currentStepIndex changes
    effect(() => {
      const currentIndex = this.currentStepIndex();
      const stepsLength = this.steps().length;
      if (stepsLength <= 1) {
        this.progressPercentage.set(100);
      } else {
        this.progressPercentage.set((currentIndex / (stepsLength - 1)) * 100);
      }
      
      // Update active step
      this.updateActiveStep();
    });
  }
  
  getStepIndicatorClasses(index: number): string {
    return cn(
      index <= this.currentStepIndex() ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500',
      index === this.currentStepIndex() ? 'motion-preset-pulse' : ''
    );
  }
  
  ngAfterContentInit() {
    // Store steps
    this.steps.set(this.stepComponents.toArray());
    
    // Set initial active step
    this.updateActiveStep();
  }
  
  nextStep() {
    if (this.currentStepIndex() < this.steps().length - 1 && this.canProceed()) {
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
    this.steps().forEach((step, index) => {
      step.setActive(index === currentIndex);
    });
  }
}