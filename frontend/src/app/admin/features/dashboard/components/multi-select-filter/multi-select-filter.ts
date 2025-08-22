import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';

interface SelectOption {
  label: string;
  value: any;
}

@Component({
  selector: 'app-multi-select-filter',
  standalone: true,
  imports: [CommonModule, MultiSelectModule, FormsModule],
  templateUrl: './multi-select-filter.html',
})
export class MultiSelectFilter {
  @Input() options: SelectOption[] = [];
  @Input() selected: any[] = [];
   @Input() placeholder: string = '';
  @Output() selectedChange = new EventEmitter<any[]>();

  onChange(event: any) {
    this.selected = event.value;
    this.selectedChange.emit(this.selected);
  }
}