import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <ng-content></ng-content>
    </div>
  `,
  styles: []
})
export class CardComponent {}

@Component({
  selector: 'ui-card-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 pb-3">
      <ng-content></ng-content>
    </div>
  `,
  styles: []
})
export class CardHeaderComponent {}

@Component({
  selector: 'ui-card-title',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h3 class="text-2xl font-semibold leading-none tracking-tight">
      <ng-content></ng-content>
    </h3>
  `,
  styles: []
})
export class CardTitleComponent {}

@Component({
  selector: 'ui-card-description',
  standalone: true,
  imports: [CommonModule],
  template: `
    <p class="text-sm text-gray-500">
      <ng-content></ng-content>
    </p>
  `,
  styles: []
})
export class CardDescriptionComponent {}

@Component({
  selector: 'ui-card-content',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 pt-0">
      <ng-content></ng-content>
    </div>
  `,
  styles: []
})
export class CardContentComponent {}

@Component({
  selector: 'ui-card-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 pt-0 flex items-center">
      <ng-content></ng-content>
    </div>
  `,
  styles: []
})
export class CardFooterComponent {}