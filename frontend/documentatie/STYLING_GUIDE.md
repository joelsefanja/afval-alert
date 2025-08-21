# Afval Alert Styling Guide

This document explains how to use the AfvalAlertPreset tokens and Tailwind CSS effectively in components without causing style conflicts.

## Design Tokens Usage

The AfvalAlertPreset defines several design tokens that can be used throughout the application:

### Color Palette
- **Primary**: Emerald shades (used for main actions and primary UI elements)
- **Secondary**: Blue shades (used for secondary actions)
- **Accent**: Amber shades (used for highlights and attention-grabbing elements)
- **Success**: Green shades (used for success states and positive feedback)
- **Warning**: Orange shades (used for warnings and cautionary messages)
- **Error**: Red shades (used for errors and destructive actions)
- **Info**: Sky blue shades (used for informational messages)

### Design Tokens
- **Border Radius**: Consistent rounded corners (small, medium, large, xlarge, full)
- **Spacing**: Consistent spacing system (xs, sm, md, lg, xl, xxl)
- **Font Sizes**: Typography scale from xs to 5xl
- **Font Weights**: Consistent font weights (light, normal, medium, semibold, bold)
- **Shadows**: Elevation system with different shadow levels (sm, md, lg, xl, 2xl)

## Using Tailwind with PrimeNG

To prevent style conflicts between Tailwind and PrimeNG:

1. **Use PrimeNG components as-is** for complex UI elements (buttons, forms, cards, etc.)
2. **Use Tailwind for layout and spacing** around PrimeNG components
3. **Use Tailwind utility classes for simple styling** (text alignment, padding, margins, flexbox, grid)
4. **Avoid overriding PrimeNG component styles directly** with Tailwind classes

## Component Structure Guidelines

When creating components, follow this structure:

```html
<!-- Container with Tailwind layout -->
<div class="p-4 md:p-6">
  <!-- Use PrimeNG components for UI elements -->
  <p-card>
    <h2 class="text-xl font-semibold mb-4">Title</h2>
    <p class="mb-4">Content with Tailwind text styling</p>
    <p-button label="Action" />
  </p-card>
  
  <!-- Use Tailwind for responsive layout -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
    <div class="bg-white p-4 rounded-lg shadow">
      <!-- Content -->
    </div>
    <div class="bg-white p-4 rounded-lg shadow">
      <!-- Content -->
    </div>
  </div>
</div>
```

## Responsive Design

All components should be mobile-first and responsive:

1. **Mobile-first approach**: Style for mobile devices first, then add larger breakpoints
2. **Use Tailwind's responsive prefixes**: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
3. **Common breakpoints**:
   - Mobile: Default (no prefix)
   - Tablet: `md:` (768px)
   - Desktop: `lg:` (1024px)
   - Large Desktop: `xl:` (1280px)

## Accessibility

Ensure all components follow accessibility guidelines:

1. **Proper semantic HTML**
2. **ARIA attributes when needed**
3. **Sufficient color contrast**
4. **Keyboard navigation support**
5. **Focus indicators**

## Example Component Structure

```typescript
import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CardModule, ButtonModule],
  template: `
    <div class="p-4 md:p-6 max-w-4xl mx-auto">
      <p-card>
        <h2 class="text-xl md:text-2xl font-semibold mb-4">Component Title</h2>
        <p class="mb-6 text-surface-700">Description text with consistent styling</p>
        <div class="flex justify-end">
          <p-button 
            label="Action" 
            icon="pi pi-check"
            severity="primary" />
        </div>
      </p-card>
    </div>
  `
})
export class ExampleComponent {}
```