import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

type ButtonVariant = 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled()"
      [class]="buttonClasses()"
      (click)="handleClick($event)"
    >
      <ng-content></ng-content>
    </button>
  `,
  styles: []
})
export class ButtonComponent {
  variant = input<ButtonVariant>('default');
  size = input<ButtonSize>('default');
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input<boolean>(false);
  fullWidth = input<boolean>(false);
  
  buttonClick = output<MouseEvent>();
  
  private readonly baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none motion-preset-pulse hover:motion-preset-bounce';
  
  private readonly variantClasses = {
    default: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    primary: 'bg-primary text-primary-foreground hover:bg-primary-600',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary-600',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-red-600',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-100',
    ghost: 'bg-transparent hover:bg-gray-100',
    link: 'text-primary underline-offset-4 hover:underline bg-transparent'
  };
  
  private readonly sizeClasses = {
    default: 'h-10 py-2 px-4',
    sm: 'h-8 px-3 text-sm',
    lg: 'h-12 px-6 text-lg',
    icon: 'h-10 w-10 p-0'
  };
  
  readonly buttonClasses = computed(() => {
    const widthClass = this.fullWidth() ? 'w-full' : '';
    return `${this.baseClasses} ${this.variantClasses[this.variant()]} ${this.sizeClasses[this.size()]} ${widthClass}`.trim();
  });
  
  handleClick(event: MouseEvent): void {
    if (!this.disabled()) {
      this.buttonClick.emit(event);
    }
  }
}