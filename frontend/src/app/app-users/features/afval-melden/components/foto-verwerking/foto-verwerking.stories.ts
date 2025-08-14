import type { Meta, StoryObj } from '@storybook/angular';
import { signal } from '@angular/core';
import { FotoVerwerkingComponent } from './foto-verwerking.component';
import { MeldingsProcedureStatus } from '../../services/melding/melding-state.service';
import { IAfvalHerkenningService } from '../../interfaces/afval-herkenning.interface';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

// Mock services
const mockMeldingsProcedureStatus = {
  fotoUrl: signal('https://picsum.photos/400/300'),
  weetje: signal('Wist je dat een plastic fles tot 450 jaar kan duren om af te breken in de natuur?'),
  afvalTypes: signal([
    { id: 'plastic', naam: 'Plastic fles', beschrijving: 'PET plastic', kleur: '#3B82F6', icoon: 'pi-circle' }
  ]),
  voltooiFotoVerwerking: (concept: any) => console.log('Foto verwerking voltooid:', concept),
  setHuidigeStap: (stap: number) => console.log('Ga naar stap:', stap)
} as any;

const mockAfvalHerkenningService = {
  uploadEnHerkenAfbeelding: () => of({
    meldingId: 'test-123',
    afvalTypes: [
      { id: 'plastic', naam: 'Plastic fles', beschrijving: 'PET plastic', kleur: '#3B82F6', icoon: 'pi-circle' }
    ],
    weetje: 'Wist je dat een plastic fles tot 450 jaar kan duren om af te breken in de natuur?'
  }).pipe(delay(2000)),
  isServiceBeschikbaar: () => of(true)
} as IAfvalHerkenningService;

const mockAfvalHerkenningServiceError = {
  uploadEnHerkenAfbeelding: () => throwError(() => new Error('AI service tijdelijk niet beschikbaar')).pipe(delay(1000)),
  isServiceBeschikbaar: () => of(false)
} as IAfvalHerkenningService;

const meta: Meta<FotoVerwerkingComponent> = {
  title: 'Components/Foto Verwerking',
  component: FotoVerwerkingComponent,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (story, context) => ({
      template: `<div class="min-h-screen bg-surface-50 dark:bg-surface-950 p-4"><story-outlet></story-outlet></div>`,
      providers: [
        { provide: MeldingsProcedureStatus, useValue: mockMeldingsProcedureStatus },
        { 
          provide: 'IAfvalHerkenningService', 
          useValue: (context.parameters?.['storyVariant'] === 'error') ? mockAfvalHerkenningServiceError : mockAfvalHerkenningService 
        }
      ]
    })
  ]
};

export default meta;
type Story = StoryObj<FotoVerwerkingComponent>;

export const Uploaden: Story = {
  name: 'Uploaden fase',
  play: async ({ canvasElement }) => {
    // Component start automatisch met uploaden
  }
};

export const Analyseren: Story = {
  name: 'Analyseren fase',
  parameters: {
    docs: {
      description: {
        story: 'Toont de AI analyse fase met weetje tijdens het wachten'
      }
    }
  }
};

export const Voltooid: Story = {
  name: 'Verwerking voltooid',
  beforeEach: () => {
    mockMeldingsProcedureStatus.afvalTypes.set([
      { id: 'plastic', naam: 'Plastic fles', beschrijving: 'PET plastic', kleur: '#3B82F6', icoon: 'pi-circle' },
      { id: 'papier', naam: 'Papier', beschrijving: 'Karton', kleur: '#F59E0B', icoon: 'pi-file' }
    ]);
  }
};

export const MetFout: Story = {
  name: 'Verwerking fout',
  parameters: {
    storyVariant: 'error'
  }
};