import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MessageService } from 'primeng/api';
import { routes } from './app.routes';
import { AFVAL_ALERT_TOKENS_PROVIDER } from './app-users/features/afval-melden/tokens/providers';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

// ✅ Gemeente kleuren + accessibility
const AfvalAlertPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
      950: '#052e16',
    },
    secondary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
    },
    accent: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
      950: '#052e16',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      950: '#450a0a',
    },
    info: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
    },
    // Toegevoegde kleuren voor grijstinten
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#030712',
    },
    // Toegevoegde kleuren voor paars (voor foto-upload component)
    purple: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87',
      950: '#3b0764',
    },
    // Toegevoegde kleuren voor blauw (voor notificaties en info)
    blue: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
    },
  },
  designTokens: {
    borderRadius: {
      none: '0',
      xs: '0.125rem', // 2px
      sm: '0.25rem', // 4px
      DEFAULT: '0.375rem', // 6px
      md: '0.5rem', // 8px
      lg: '0.75rem', // 12px
      xl: '1rem', // 16px
      '2xl': '1.5rem', // 24px
      '3xl': '2rem', // 32px
      full: '9999px',
    },
    spacing: {
      0: '0',
      1: '0.25rem',
      2: '0.5rem',
      3: '0.75rem',
      4: '1rem',
      5: '1.25rem',
      6: '1.5rem',
      8: '2rem',
      10: '2.5rem',
      12: '3rem',
      16: '4rem',
      20: '5rem',
      24: '6rem',
      32: '8rem',
      40: '10rem',
      48: '12rem',
      56: '14rem',
      64: '16rem',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    shadow: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    },
  },
  // Component-specifieke stijling
  components: {
    // AfvalMelden hoofdcomponent
    afvalMelden: {
      header: {
        background: 'var(--surface-0)',
        titleColor: 'var(--primary-800)',
        shadow: 'var(--shadow-sm)',
      },
      container: {
        background: 'var(--surface-50)',
      },
    },
    // Introductie stap component
    introductieStap: {
      container: {
        background: 'linear-gradient(to bottom right, var(--green-50), var(--blue-50))',
      },
      card: {
        background: 'var(--surface-0)',
        borderRadius: 'var(--border-radius-3xl)',
        shadow: 'var(--shadow-xl)',
      },
      iconContainer: {
        background: 'var(--green-100)',
        borderRadius: 'var(--border-radius-full)',
      },
      icon: {
        color: 'var(--green-600)',
      },
      title: {
        color: 'var(--gray-800)',
      },
      description: {
        color: 'var(--gray-600)',
      },
      button: {
        background: 'var(--green-600)',
        color: 'var(--surface-0)',
        borderRadius: 'var(--border-radius-2xl)',
        shadow: 'var(--shadow-lg)',
        hoverBackground: 'var(--green-700)',
      },
      footer: {
        color: 'var(--gray-500)',
      },
    },
    // Foto upload component
    fotoUpload: {
      container: {
        background: 'var(--gray-50)',
      },
      header: {
        background: 'linear-gradient(to right, var(--purple-500), var(--purple-600))',
        color: 'var(--surface-0)',
        subtitleColor: 'var(--purple-100)',
      },
      statusBar: {
        background: 'var(--blue-50)',
        borderColor: 'var(--blue-200)',
        iconColor: 'var(--blue-500)',
        textColor: 'var(--blue-700)',
      },
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    providePrimeNG({
      theme: {
        preset: AfvalAlertPreset,
        options: {
          prefix: 'p',
          darkModeSelector: '.app-dark',
          cssLayer: {
            name: 'primeng',
            order: 'reset, tailwind, primeng, components',
          },
        },
      },
    }),
    AFVAL_ALERT_TOKENS_PROVIDER.default,
    MessageService,
    // Removed complex classification providers - using simple MediaOrchestratorService
  ],
};