import { Component, input, output, computed } from '@angular/core';
import { cva, VariantProps } from 'class-variance-authority';
import { cn } from '@app/app-users/shared/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none motion-preset-pulse hover:motion-preset-bounce',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-primary-dark',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
        outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
        ghost: 'hover:bg-gray-100 hover:text-gray-900',
        link: 'underline-offset-4 hover:underline text-primary',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

@Component({
  selector: 'ui-button',
  standalone: true,
  template: `
    <button
      [class]="buttonClasses()"
      [disabled]="disabled()"
      [type]="type()"
      (click)="onClick.emit($event)"
      [attr.aria-disabled]="disabled()"
    >
      <ng-content></ng-content>
    </button>
  `,
})
export class ButtonComponent {
  variant = input<ButtonVariants['variant']>('default');
  size = input<ButtonVariants['size']>('default');
  disabled = input<boolean>(false);
  type = input<'button' | 'submit' | 'reset'>('button');
  class = input<string>('');
  
  onClick = output<MouseEvent>();

  readonly buttonClasses = computed(() => {
    return cn(
      buttonVariants({ 
        variant: this.variant(), 
        size: this.size() 
      }), 
      this.class()
    );
  });
}