import type { Meta, StoryObj } from '@storybook/angular';
import { signal } from '@angular/core';
import { VerzendStapComponent } from './verzend-stap.component';
import { MeldingsProcedureStatus } from '../../services/melding/melding-state.service';
import { IMeldingService } from '../../interfaces/melding.interface';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

// Mock services
const mockMeldingsProcedureStatus = {
  meldingConcept: signal({
    id: 'test-123',
    afbeeldingUrl: 'https://picsum.photos/400/300',
    afvalTypes: [
      { id: 'plastic', naam: 'Plastic fles', beschrijving: 'PET plastic', kleur: '#3B82F6', icoon: 'pi-circle' }
    ],
    weetje: 'Test weetje',
    status: 4,
    aanmaakDatum: new Date(),
    contact: { email: 'test@example.com' }
  }),
  afvalTypes: signal([
    { id: 'plastic', naam: 'Plastic fles', beschrijving: 'PET plastic', kleur: '#3B82F6', icoon: 'pi-circle' }
  ]),
  locatieAdres: signal('Grote Markt 1, 9712 HN Groningen'),
  locatieCoordinaten: signal({ lat: 53.2194, lng: 6.5665 }),
  contactInfo: signal({ email: 'test@example.com' }),
  setVerzenden: (status: boolean) => console.log('Verzend status:', status),
  setVerzendError: (error: string) => console.log('Verzend error:', error),
  setHuidigeStap: (stap: number) => console.log('Ga naar stap:', stap)
} as any;

const mockMeldingService = {
  verzendMelding: () => of({ success: true }).pipe(delay(2000)),
  getMeldingConcept: () => of(null),
  slaaMeldingConceptOp: () => of(true),
  verwijderMeldingConcept: () => of(true)
} as IMeldingService;

const mockMeldingServiceError = {
  verzendMelding: () => throwError(() => new Error('Netwerk fout')).pipe(delay(1000)),
  getMeldingConcept: () => of(null),
  slaaMeldingConceptOp: () => of(true),
  verwijderMeldingConcept: () => of(true)
} as IMeldingService;

const meta: Meta<VerzendStapComponent> = {
  title: 'Components/Verzend Stap',
  component: VerzendStapComponent,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (story, context) => ({
      template: `<div class="min-h-screen bg-surface-50 dark:bg-surface-950 p-4"><story-outlet></story-outlet></div>`,
      providers: [
        { provide: MeldingsProcedureStatus, useValue: mockMeldingsProcedureStatus },
        { 
          provide: 'IMeldingService', 
          useValue: (context.parameters?.['storyVariant'] === 'error') ? mockMeldingServiceError : mockMeldingService 
        }
      ]
    })
  ]
};

export default meta;
type Story = StoryObj<VerzendStapComponent>;

export const Verzenden: Story = {
  name: 'Melding verzenden',
};

export const Succes: Story = {
  name: 'Verzending succesvol',
  play: async ({ canvasElement }) => {
    // Wacht tot verzending voltooid is
    await new Promise(resolve => setTimeout(resolve, 2500));
  }
};

export const MetFout: Story = {
  name: 'Verzending fout',
  parameters: {
    storyVariant: 'error'
  }
};