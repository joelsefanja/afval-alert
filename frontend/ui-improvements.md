# UI Improvement Suggestions for Afval Melden Feature

This document outlines suggestions for improving the UI of the "Afval Melden" feature, focusing on reducing PrimeNG and Tailwind usage, improving UI/UX, and reducing clutter.

## 1. General Recommendations

*   **Replace PrimeNG components**: Replace PrimeNG components with standard HTML elements and custom SCSS styling.
*   **Reduce Tailwind usage**: Move Tailwind classes to SCSS files to improve readability and maintainability.
*   **Use a consistent design system**: Define a set of design principles and guidelines to ensure a consistent look and feel across the application.
*   **Create reusable components**: Identify common UI patterns and create reusable components for them.
*   **Improve component naming**: Use clear and descriptive names for components to make it easier to understand their purpose and functionality.
*   **Centralize styling**: Move all component-specific styles to their respective SCSS files to avoid inline styles and CSS clutter.

## 2. Component-Specific Suggestions

### 2.1. `start-stap.component.html`

*   **UI Clutter**: The "Quick Features" section (2 min, Anoniem, Direct) could be simplified. Instead of using separate divs with icons and text, consider a single line of text that summarizes the key benefits.

    **Example:**

    **Original code:**

    ```html
    <div class="grid grid-cols-3 gap-3 text-center">
        <div class="bg-white bg-opacity-70 backdrop-blur-sm rounded-xl p-3 shadow-sm">
            <i class="pi pi-clock text-green-600 text-lg mb-1"></i>
            <p class="text-xs font-medium text-gray-700">2 min</p>
        </div>
        <div class="bg-white bg-opacity-70 backdrop-blur-sm rounded-xl p-3 shadow-sm">
            <i class="pi pi-shield text-green-600 text-lg mb-1"></i>
            <p class="text-xs font-medium text-gray-700">Anoniem</p>
        </div>
        <div class="bg-white bg-opacity-70 backdrop-blur-sm rounded-xl p-3 shadow-sm">
            <i class="pi pi-check text-green-600 text-lg mb-1"></i>
            <p class="text-xs font-medium text-gray-700">Direct</p>
        </div>
    </div>
    ```

    **Replacement:**

    ```html
    <p class="text-sm text-gray-500 text-center">
        Snel, anoniem en direct
    </p>
    ```

*   **UI Improvement:** The animated icon hero is visually appealing but might be distracting. Consider making the animation more subtle or providing an option to disable it.
*   **Accessibility:** Ensure the button has proper ARIA attributes for accessibility.

### 2.2. `locatie-stap.component.html`

*   **UI Clutter:** The "Locatie bevestigd!" message could be displayed in a less intrusive way. Consider using a subtle animation or a simple checkmark icon instead of a full-fledged card.

    **Example:**

    **Original code:**

    ```html
    <div class="bg-green-100 border border-green-200 rounded-xl p-4 mb-4 motion-preset-scale-in">
        <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <i class="pi pi-check text-white text-sm"></i>
            </div>
            <div class="flex-1">
                <h3 class="font-semibold text-green-800 mb-1 text-sm">
                    Locatie geselecteerd
                </h3>
                <p class="text-green-700 text-sm">
                    {{ locatieState().selectedAddress || 'Geselecteerde locatie' }}
                </p>
            </div>
        </div>
    </div>
    ```

    **Replacement:**

    ```html
    <div class="flex items-center gap-2 text-green-700 text-sm mb-2">
        <i class="pi pi-check-circle"></i>
        Locatie geselecteerd: {{ locatieState().selectedAddress || 'Geselecteerde locatie' }}
    </div>
    ```

*   **UI Improvement:** The map section could be improved by adding a search bar for easier location selection.
*   **Responsiveness:** Ensure the map and location selection elements are responsive on different screen sizes.

### 2.3. `foto-stap.component.html`

*   **UI Clutter:** The camera overlay indicators (corner lines) might be unnecessary. Consider removing them or making them optional.
*   **UI Improvement:** Add a progress indicator while the photo is being processed.
*   **Accessibility:** Ensure the camera controls are accessible to users with disabilities.

### 2.4. `succes-stap.component.html`

*   **UI Improvement:** The "Wat gebeurt er nu" card could be made more interactive, perhaps by showing a timeline of the process.
*   **UI Improvement:** The contact information card could include a direct link to the user's email client.
*   **PrimeNG Replacement**: Replace `p-card` with a `div` and custom styling in SCSS.
*   **PrimeNG Replacement**: Replace `p-button` with a `button` and custom styling in SCSS.

    **Example:**

    **Original code:**

    ```html
    <p-button 
        label="Nieuwe melding maken" 
        icon="pi pi-plus"
        size="large"
        (onClick)="nieuweMelding()"
        class="w-full"
        [raised]="true"
    />
    ```

    **Replacement:**

    ```html
    <button 
        (click)="nieuweMelding()"
        class="custom-button w-full">
        <i class="pi pi-plus"></i>
        Nieuwe melding maken
    </button>
    ```

    **SCSS (`succes-stap.component.scss`):**

    ```scss
    .custom-button {
        @apply w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg transform transition-all duration-300 ease-out hover:scale-105 hover:shadow-2xl active:scale-95 focus:outline-none focus:ring-4 focus:ring-green-300;

        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;

        &:hover {
            @apply scale-105 shadow-2xl;
        }

        &:active {
            @apply scale-95;
        }

        &:focus {
            @apply ring-4 ring-green-300 outline-none;
        }
    }
    ```

### 2.5. `verzend-stap.component.html`

*   **UI Improvement:** The "Melding wordt verzonden..." message could be more engaging, perhaps by showing a progress bar or an animation of the data being sent.
*   **UI Improvement:** The error message could provide more specific instructions on how to resolve the issue.
*   **PrimeNG Replacement**: Replace `p-card` with a `div` and custom styling in SCSS.
*   **PrimeNG Replacement**: Replace `p-progressSpinner` with a custom spinner component or an animated `div` with SCSS styling.
*   **PrimeNG Replacement**: Replace `p-message` with a `div` and custom styling in SCSS.
*   **PrimeNG Replacement**: Replace `p-button` with a `button` and custom styling in SCSS.

## 3. Tailwind Reduction

*   Move Tailwind classes to SCSS files.
*   Use SCSS variables for commonly used values.
*   Use SCSS mixins for reusable styles.

By implementing these suggestions, you can improve the UI/UX of the "Afval Melden" feature, reduce the usage of PrimeNG and Tailwind, and create a more maintainable and scalable codebase.