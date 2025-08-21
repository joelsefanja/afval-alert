import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe voor het formatteren van confidence scores naar leesbare tekst
 * Vervangst inline formattering logic in templates
 */
@Pipe({
  name: 'confidenceFormat',
  standalone: true
})
export class ConfidenceFormatPipe implements PipeTransform {
  
  /**
   * Transformeert confidence score naar geformatteerde string
   * @param confidence - Confidence score tussen 0.0 en 1.0
   * @param format - Format type: 'percentage' | 'rounded'
   * @returns Geformatteerde string
   */
  transform(confidence: number, format: 'percentage' | 'rounded' = 'percentage'): string {
    if (confidence == null || confidence < 0 || confidence > 1) {
      return '0%';
    }
    
    switch (format) {
      case 'percentage':
        return `${Math.round(confidence * 100)}%`;
      case 'rounded':
        return (confidence * 100).toFixed(1) + '%';
      default:
        return `${Math.round(confidence * 100)}%`;
    }
  }
}