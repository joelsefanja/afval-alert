import { Injectable, signal, computed, Type } from '@angular/core';
import { MenuItem } from 'primeng/api';

export interface StepConfig {
  label: string;
  component: Type<any>;
  icon?: string;
  disabled?: boolean;
}

@Injectable({ providedIn: 'root' })
export class StepBuilderService {
  private steps = signal<StepConfig[]>([]);
  readonly activeIndex = signal(0);

  readonly currentStep = computed(() => this.steps()[this.activeIndex()]);
  readonly totalSteps = computed(() => this.steps().length);
  readonly isFirst = computed(() => this.activeIndex() === 0);
  readonly isLast = computed(() => this.activeIndex() === this.totalSteps() - 1);
  readonly menuItems = computed((): MenuItem[] => 
    this.steps().map((step, i) => ({
      label: step.label,
      icon: step.icon,
      disabled: step.disabled || i > this.activeIndex()
    }))
  );

  addStep(config: StepConfig) {
    this.steps.update(steps => [...steps, config]);
    return this;
  }

  next() {
    if (!this.isLast()) this.activeIndex.update(i => i + 1);
    return this;
  }

  prev() {
    if (!this.isFirst()) this.activeIndex.update(i => i - 1);
    return this;
  }

  goto(index: number) {
    if (index >= 0 && index < this.totalSteps()) this.activeIndex.set(index);
    return this;
  }

  reset() {
    this.activeIndex.set(0);
    return this;
  }
}