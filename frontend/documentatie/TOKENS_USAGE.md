# Using Design Tokens in Components

This guide explains how to use the Afval Alert design tokens in your components.

## Injecting Tokens

To use the design tokens in a component, inject them using the `AFVAL_ALERT_TOKENS` token:

```typescript
import { Component, inject } from '@angular/core';
import { AFVAL_ALERT_TOKENS, AfvalAlertTokens } from '@tokens/afval-alert.tokens';

@Component({
  selector: 'app-example',
  standalone: true,
  template: `
    <div [style.border-radius]="tokens.borderRadius.medium">
      Content with medium border radius
    </div>
  `
})
export class ExampleComponent {
  protected tokens = inject(AFVAL_ALERT_TOKENS);
}
```

## Using Color Tokens with Tailwind

The color tokens can be used directly with Tailwind classes:

```html
<!-- Primary color -->
<div class="bg-primary-500 text-white">Primary Background</div>

<!-- Secondary color -->
<div class="bg-secondary-500 text-white">Secondary Background</div>

<!-- Success color -->
<div class="bg-success-500 text-white">Success Background</div>

<!-- Warning color -->
<div class="bg-warning-500 text-white">Warning Background</div>

<!-- Error color -->
<div class="bg-error-500 text-white">Error Background</div>
```

## Using Spacing Tokens

Use the spacing tokens for consistent margins and padding:

```html
<div class="p-4 md:p-6">Responsive padding</div>
<div class="m-4">Margin using token values</div>
<div class="space-y-4">Vertical spacing between children</div>
```

## Using Typography Tokens

Use the typography tokens for consistent text styling:

```html
<h1 class="text-3xl font-bold">Heading with large font size</h1>
<h2 class="text-xl font-semibold">Subheading with medium font size</h2>
<p class="text-base">Body text with base font size</p>
<small class="text-sm">Small text</small>
```

## Using Border Radius Tokens

Use the border radius tokens for consistent rounded corners:

```html
<div class="rounded">Default rounded corners</div>
<div class="rounded-lg">Large rounded corners</div>
<div class="rounded-full">Fully rounded</div>
```

## Using Shadow Tokens

Use the shadow tokens for consistent elevation:

```html
<div class="shadow-sm">Small shadow</div>
<div class="shadow">Medium shadow</div>
<div class="shadow-lg">Large shadow</div>
```

## Best Practices

1. **Use Tailwind classes for simple styling** - For colors, spacing, typography, etc.
2. **Use PrimeNG components for complex UI elements** - Buttons, forms, cards, etc.
3. **Inject tokens when you need dynamic values** - For programmatically setting styles
4. **Maintain consistency** - Use the same tokens throughout the application
5. **Follow the mobile-first approach** - Style for mobile first, then add larger breakpoints