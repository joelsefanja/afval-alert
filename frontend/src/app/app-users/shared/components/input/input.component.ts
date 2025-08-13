import { Component, input, output, computed, signal, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  selector: 'ui-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative">
      <input
        [type]="type()"
        [id]="id()"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [required]="required()"
        [class]="inputClasses()"
        [(ngModel)]="inputValue"
        (blur)="onTouched()"
        (input)="onInputChange($event)"
      />
    </div>
  `,
  styles: [],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ]
})
export class InputComponent implements ControlValueAccessor {
  type = input<'text' | 'email' | 'password' | 'number' | 'tel'>('text');
  id = input<string>('');
  placeholder = input<string>('');
  disabled = input<boolean>(false);
  required = input<boolean>(false);
  error = input<boolean>(false);
  
  valueChange = output<string>();
  
  inputValue = signal<string>('');
  
  private readonly baseClasses = 'form-input flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 motion-preset-focus-in';
  
  readonly inputClasses = computed(() => {
    const errorClasses = this.error() ? 'border-destructive' : 'border-gray-300';
    return `${this.baseClasses} ${errorClasses}`;
  });
  
  get value(): string {
    return this.inputValue();
  }
  
  set value(val: string) {
    this.inputValue.set(val || '');
  }
  
  private onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};
  
  writeValue(value: string): void {
    this.value = value || '';
  }
  
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  
  setDisabledState(isDisabled: boolean): void {
    // Voor ControlValueAccessor compatibility
  }
  
  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }
}