import { Component, forwardRef, input, signal, computed } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { cn } from '@app/app-users/shared/utils/cn';

@Component({
  selector: 'ui-input',
  standalone: true,
  template: `
    <input
      [class]="inputClasses()"
      [type]="type()"
      [placeholder]="placeholder()"
      [disabled]="disabled()"
      [value]="value()"
      (input)="onInputChange($event)"
      (blur)="onTouched()"
    />
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor {
  type = input<string>('text');
  placeholder = input<string>('');
  disabled = input<boolean>(false);
  error = input<boolean>(false);
  className = input<string>('');

  value = signal('');
  
  readonly inputClasses = computed(() => 
    cn(
      'form-input flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm motion-preset-focus-in',
      'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
      this.error() ? 'border-red-500 focus:ring-red-500' : '',
      this.disabled() ? 'cursor-not-allowed opacity-50' : '',
      this.className()
    )
  );
  
  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value.set(value || '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(): void {
    // Voor ControlValueAccessor compatibility
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value.set(target.value);
    this.onChange(target.value);
  }
}