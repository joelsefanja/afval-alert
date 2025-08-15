import type { Meta, StoryObj } from '@storybook/angular';
import { signal } from '@angular/core';
import { SuccesStapComponent } from './succes-stap.component';
import { MeldingsProcedureStatus } from '../../services/melding/melding-state.service';

// Mock services
const mockMeldingsProcedureStatusMetContact = {
  contactInfo: signal({ email: 'test@example.com', naam: 'Jan Jansen' }),
  resetState: () => console.log('State reset')
} as any;

const mockMeldingsProcedureStatusAnoniem = {
  contactInfo: signal({}),
  resetState: () => console.log('State reset')
} as any;

const meta: Meta<SuccesStapComponent> = {
  title: 'Components/Succes Stap',
  component: SuccesStapComponent,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (story, context) => ({
      template: `<div class="min-h-screen bg-surface-50 dark:bg-surface-950 p-4"><story-outlet></story-outlet></div>`,
      providers: [
        { 
          provide: MeldingsProcedureStatus, 
          useValue: (context.parameters?.['storyVariant'] === 'anoniem') ? mockMeldingsProcedureStatusAnoniem : mockMeldingsProcedureStatusMetContact 
        }
      ]
    })
  ]
};

export default meta;
type Story = StoryObj<SuccesStapComponent>;

export const MetContact: Story = {
  name: 'Met contactgegevens',
  parameters: {
    docs: {
      description: {
        story: 'Toont succes pagina met email bevestiging wanneer gebruiker contactgegevens heeft ingevuld'
      }
    }
  }
};

export const Anoniem: Story = {
  name: 'Anonieme melding',
  parameters: {
    storyVariant: 'anoniem',
    docs: {
      description: {
        story: 'Toont succes pagina zonder email bevestiging voor anonieme meldingen'
      }
    }
  }
};

export const DarkMode: Story = {
  name: 'Dark Mode',
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (story, context) => ({
      template: `<div class="min-h-screen bg-surface-950 dark p-4"><story-outlet></story-outlet></div>`,
      providers: [
        { provide: MeldingsProcedureStatus, useValue: mockMeldingsProcedureStatusMetContact }
      ]
    })
  ]
};