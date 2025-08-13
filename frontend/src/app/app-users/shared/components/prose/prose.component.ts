import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '@app/app-users/shared/utils/cn';

type TextContentSize = 'sm' | 'base' | 'lg' | 'xl' | '2xl';

@Component({
  selector: 'ui-text-content',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="textClasses()">
      <ng-content></ng-content>
    </div>
  `,
})
export class TextContentComponent {
  size = input<TextContentSize>('base');
  className = input<string>('');
  
  readonly textClasses = computed(() => {
    const sizeClasses = {
      sm: 'prose-sm',
      base: 'prose',
      lg: 'prose-lg', 
      xl: 'prose-xl',
      '2xl': 'prose-2xl'
    };
    
    return cn(
      sizeClasses[this.size()],
      'prose-gray max-w-none',
      'prose-headings:text-gray-900',
      'prose-p:text-gray-700 prose-p:leading-relaxed',
      'prose-strong:text-gray-900',
      'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
      'prose-ul:text-gray-700 prose-ol:text-gray-700',
      'prose-li:text-gray-700',
      'prose-blockquote:text-gray-600 prose-blockquote:border-primary',
      'motion-preset-fade',
      this.className()
    );
  });
}