import type { Meta, StoryObj } from '@storybook/angular';
import { signal } from '@angular/core';
import { ControleStapComponent } from './controle-stap.component';
import { MeldingsProcedureStatus } from '../../services/melding/melding-state.service';

// Mock service
const mockMeldingsProcedureStatus = {
  fotoUrl: signal('https://picsum.photos/400/300'),
  afvalTypes: signal([
    { id: 'plastic', naam: 'Plastic fles', beschrijving: 'PET plastic', kleur: '#3B82F6', icoon: 'pi-circle' },
    { id: 'papier', naam: 'Papier', beschrijving: 'Karton', kleur: '#F59E0B', icoon: 'pi-file' }
  ]),
  locatieAdres: signal('Grote Markt 1, 9712 HN Groningen'),
  locatieCoordinaten: signal({ lat: 53.2194, lng: 6.5665 }),
  contactInfo: signal({ email: 'test@example.com', naam: 'Jan Jansen', telefoon: '06-12345678' }),
  gaTerugNaarVorige: () => console.log('Terug'),
  setHuidigeStap: (stap: number) => console.log('Ga naar stap:', stap)
} as any;

const mockMeldingsProcedureStatusAnoniem = {
  ...mockMeldingsProcedureStatus,
  contactInfo: signal({})
} as any;

const meta: Meta<ControleStapComponent> = {
  title: 'Components/Controle Stap',
  component: ControleStapComponent,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (story, context) => ({
      template: `<div class="min-h-screen bg-surface-50 dark:bg-surface-950 p-4"><story-outlet></story-outlet></div>`,
      providers: [
        { 
          provide: MeldingsProcedureStatus, 
          useValue: (context.parameters?.['storyVariant'] === 'anoniem') ? mockMeldingsProcedureStatusAnoniem : mockMeldingsProcedureStatus 
        }
      ]
    })
  ]
};

export default meta;
type Story = StoryObj<ControleStapComponent>;

export const Default: Story = {
  name: 'Standaard - Met contactgegevens',
};

export const Anoniem: Story = {
  name: 'Anonieme melding',
  parameters: {
    storyVariant: 'anoniem'
  }
};

export const EnkelAfvalType: Story = {
  name: 'Enkele afvaltype',
  beforeEach: () => {
    mockMeldingsProcedureStatus.afvalTypes.set([
      { id: 'plastic', naam: 'Plastic fles', beschrijving: 'PET plastic', kleur: '#3B82F6', icoon: 'pi-circle' }
    ]);
  }
};

export const MeerdereAfvalTypes: Story = {
  name: 'Meerdere afvaltypes',
  beforeEach: () => {
    mockMeldingsProcedureStatus.afvalTypes.set([
      { id: 'plastic', naam: 'Plastic fles', beschrijving: 'PET plastic', kleur: '#3B82F6', icoon: 'pi-circle' },
      { id: 'papier', naam: 'Papier', beschrijving: 'Karton', kleur: '#F59E0B', icoon: 'pi-file' },
      { id: 'glas', naam: 'Glas', beschrijving: 'Glazen fles', kleur: '#8B5CF6', icoon: 'pi-circle' }
    ]);
  }
};