import type { Meta, StoryObj } from '@storybook/angular';
import { signal } from '@angular/core';
import { ContactStapComponent } from './contact-stap.component';
import { MeldingsProcedureStatus } from '../../services/melding/melding-state.service';

// Mock service
const mockMeldingsProcedureStatus = {
  emailError: signal(''),
  gaTerugNaarVorige: () => console.log('Terug'),
  gaNaarVolgende: () => console.log('Volgende'),
  setContactInfo: (info: any) => console.log('Set contact info:', info)
} as any;

const meta: Meta<ContactStapComponent> = {
  title: 'Components/Contact Stap',
  component: ContactStapComponent,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (story, context) => ({
      template: `<div class="min-h-screen bg-surface-50 dark:bg-surface-950 p-4"><story-outlet></story-outlet></div>`,
      providers: [
        { provide: MeldingsProcedureStatus, useValue: mockMeldingsProcedureStatus }
      ]
    })
  ]
};

export default meta;
type Story = StoryObj<ContactStapComponent>;

export const Default: Story = {
  name: 'Standaard - Contact formulier',
};

export const MetError: Story = {
  name: 'Met validatie fout',
  beforeEach: () => {
    mockMeldingsProcedureStatus.emailError.set('Voer een geldig e-mailadres in');
  }
};

export const Anoniem: Story = {
  name: 'Anonieme melding',
  play: async ({ canvasElement }) => {
    const checkbox = canvasElement.querySelector('input[type="checkbox"]') as HTMLInputElement;
    if (checkbox) {
      checkbox.click();
    }
  }
};