# Developer Guide: Design Tokens Gebruiken

Deze gids legt uit hoe je de Afval Alert design tokens effectief kunt gebruiken in je Angular-componenten.

## Kernconcept: Statische vs. Dynamische Styling

Het is cruciaal om te begrijpen wanneer je tokens moet injecteren en wanneer je dat niet hoeft te doen.

-   **Statische Styling (Geen injectie nodig):** Voor de meeste styling gebruik je direct de utility classes van **Tailwind CSS** in je HTML-templates. De Tailwind-configuratie is al ingesteld om onze design tokens te gebruiken. Je hoeft de tokens dus **niet** te injecteren.

    ```html
    <!-- Voorbeeld: gebruik van kleuren en spacing zonder injectie -->
    <div class="bg-primary-500 text-white p-4 rounded-lg">
      Deze div gebruikt Tailwind classes die gekoppeld zijn aan onze design tokens.
    </div>
    ```

-   **Dynamische Styling (Injectie vereist):** Je injecteert de `AFVAL_ALERT_TOKENS` alleen wanneer je stijlen **programmatisch** moet toepassen vanuit je component-logica. Bijvoorbeeld, wanneer een stijl afhankelijk is van een state of een property.

    ```typescript
    // Voorbeeld: een achtergrondkleur dynamisch instellen
    @Component({
      template: `<div [style.background-color]="dynamischeKleur">...</div>`
    })
    export class MijnComponent {
      protected tokens = inject(AFVAL_ALERT_TOKENS);
      gebruikerIsActief = true;

      get dynamischeKleur() {
        return this.gebruikerIsActief ? this.tokens.colors.success[500] : this.tokens.colors.gray[500];
      }
    }
    ```

## 1. Tokens Injecteren (Alleen voor Dynamische Styling)

Indien nodig, injecteer de tokens met Angular's `inject()` functie:

```typescript
import { Component, inject } from '@angular/core';
import { AFVAL_ALERT_TOKENS } from '@tokens/afval-alert.tokens';

@Component({
  selector: 'app-voorbeeld',
  standalone: true,
  template: `<div>Voorbeeld Component</div>`
})
export class VoorbeeldComponent {
  // Injecteer de tokens alleen als je ze in je component-logica nodig hebt
  protected tokens = inject(AFVAL_ALERT_TOKENS);

  getPrimaryColor() {
    // Voorbeeld van dynamisch gebruik
    return this.tokens.primary; // Geeft 'emerald' terug
  }
}
```

## 2. Kleuren Tokens

Gebruik de Tailwind classes voor een consistente kleurtoepassing.

-   **Primary**: `emerald`
-   **Secondary**: `blue`
-   **Accent**: `amber`
-   **Success**: `green`
-   **Warning**: `orange`
-   **Error**: `red`
-   **Info**: `sky`

```html
<div class="bg-primary-500 text-white">Primaire Achtergrond</div>
<div class="text-secondary-600">Secundaire Tekst</div>
<div class="border-accent-400">Accent Rand</div>
```

## 3. Spacing Tokens

Gebruik de `p-`, `m-` en `space-y-` utilities van Tailwind voor consistente spacing.

```html
<div class="p-4 md:p-6">Responsive padding</div>
<div class="m-4">Marge</div>
<div class="space-y-4">Verticale ruimte tussen kinderen</div>
```

## 4. Border Radius Tokens

Gebruik de `rounded-` utilities van Tailwind.

```html
<div class="rounded-md">Medium afgeronde hoeken</div>
<div class="rounded-lg">Grote afgeronde hoeken</div>
<div class="rounded-full">Volledig rond</div>
```

## 5. Typografie Tokens

Gebruik de `text-` en `font-` utilities van Tailwind.

```html
<h1 class="text-3xl font-bold">Grote Titel</h1>
<h2 class="text-xl font-semibold">Subtitel</h2>
<p class="text-base">Normale tekst</p>
```

## 6. Shadow Tokens

Gebruik de `shadow-` utilities van Tailwind.

```html
<div class="shadow-sm">Kleine schaduw</div>
<div class="shadow-lg">Grote schaduw</div>
```

## Best Practices

1.  **Gebruik Tailwind classes voor 99% van je styling.** Dit is de standaard en vereist geen injectie.
2.  **Injecteer tokens alléén voor dynamische stijlen** die je niet met Tailwind classes in de template kunt oplossen.
3.  **Volg de mobile-first aanpak** van Tailwind (`md:`, `lg:`, etc.).
4.  **Combineer met PrimeNG componenten:** Gebruik PrimeNG voor complexe UI-elementen en Tailwind voor layout en positionering.

## Compleet Voorbeeld

Dit component gebruikt Tailwind voor layout en styling, en injecteert de tokens **niet** omdat alle styling statisch is.

```typescript
import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-voorbeeld-best-practice',
  standalone: true,
  imports: [CardModule, ButtonModule],
  template: `
    <div class="p-4 md:p-6 max-w-4xl mx-auto">
      <p-card>
        <h2 class="text-xl font-semibold mb-4">Voorbeeld Kaart</h2>
        <p class="mb-4">Deze kaart gebruikt Tailwind voor layout en PrimeNG voor de kaart-component.</p>
        <div class="flex justify-end">
          <!-- De button gebruikt de 'primary' stijl van PrimeNG, die al gekoppeld is aan onze tokens -->
          <p-button label="Actie" severity="primary" />
        </div>
      </p-card>
    </div>
  `
})
export class VoorbeeldComponent {
  // Geen injectie van tokens nodig!
}
```
