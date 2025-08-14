import type { Meta, StoryObj } from '@storybook/angular';
import { StartStapComponent } from './start-stap.component';
import { MeldingsProcedureStatus } from '../../services/melding/melding-state.service';

// Mock service
const mockMeldingsProcedureStatus = {
  gaNaarVolgende: () => console.log('Start melding clicked')
} as any;

const meta: Meta<StartStapComponent> = {
  title: 'Components/Start Stap',
  component: StartStapComponent,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (story, context) => ({
      template: `<div class="min-h-screen bg-surface-50 dark:bg-surface-950"><story-outlet></story-outlet></div>`,
      providers: [
        { provide: MeldingsProcedureStatus, useValue: mockMeldingsProcedureStatus }
      ]
    })
  ]
};

export default meta;
type Story = StoryObj<StartStapComponent>;

export const Default: Story = {
  name: 'Standaard',
};

export const DarkMode: Story = {
  name: 'Dark Mode',
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (story, context) => ({
      template: `<div class="min-h-screen bg-surface-950 dark"><story-outlet></story-outlet></div>`,
      providers: [
        { provide: MeldingsProcedureStatus, useValue: mockMeldingsProcedureStatus }
      ]
    })
  ]
};