import { Component, Input, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultiSelectModule } from 'primeng/multiselect';

interface SelectOption {
  label: string;
  value: any;
}

@Component({
  selector: 'app-multi-select-filter',
  standalone: true,
  imports: [CommonModule, MultiSelectModule],
  templateUrl: './multi-select-filter.html',
  styleUrls: ['./multi-select-filter.scss'],
})
export class MultiSelectFilter {
  @Input() options: SelectOption[] = [];
  @Input() selected!: WritableSignal<any[]>;
  @Input() placeholder: string = '';

  /** Update signal when selection changes */
  onChange(event: any) {
    this.selected.set(event.value);
  }
}