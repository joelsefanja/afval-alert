import { Component, input, computed } from '@angular/core';
import { cn } from '@app/app-users/shared/utils/cn';

@Component({
  selector: 'ui-card',
  standalone: true,
  template: `
    <div [class]="cardClasses()">
      <ng-content></ng-content>
    </div>
  `,
})
export class CardComponent {
  className = input<string>('');
  
  readonly cardClasses = computed(() => 
    cn('rounded-lg border bg-white shadow-sm motion-preset-fade', this.className())
  );
}

@Component({
  selector: 'ui-card-header',
  standalone: true,
  template: `
    <div [class]="headerClasses()">
      <ng-content></ng-content>
    </div>
  `,
})
export class CardHeaderComponent {
  className = input<string>('');
  
  readonly headerClasses = computed(() => 
    cn('flex flex-col space-y-1.5 p-6', this.className())
  );
}

@Component({
  selector: 'ui-card-title',
  standalone: true,
  template: `
    <h3 [class]="titleClasses()">
      <ng-content></ng-content>
    </h3>
  `,
})
export class CardTitleComponent {
  className = input<string>('');
  
  readonly titleClasses = computed(() => 
    cn('text-2xl font-semibold leading-none tracking-tight', this.className())
  );
}

@Component({
  selector: 'ui-card-description',
  standalone: true,
  template: `
    <p [class]="descriptionClasses()">
      <ng-content></ng-content>
    </p>
  `,
})
export class CardDescriptionComponent {
  className = input<string>('');
  
  readonly descriptionClasses = computed(() => 
    cn('text-sm text-gray-500', this.className())
  );
}

@Component({
  selector: 'ui-card-content',
  standalone: true,
  template: `
    <div [class]="contentClasses()">
      <ng-content></ng-content>
    </div>
  `,
})
export class CardContentComponent {
  className = input<string>('');
  
  readonly contentClasses = computed(() => 
    cn('p-6 pt-0', this.className())
  );
}

@Component({
  selector: 'ui-card-footer',
  standalone: true,
  template: `
    <div [class]="footerClasses()">
      <ng-content></ng-content>
    </div>
  `,
})
export class CardFooterComponent {
  className = input<string>('');
  
  readonly footerClasses = computed(() => 
    cn('flex items-center p-6 pt-0', this.className())
  );
}