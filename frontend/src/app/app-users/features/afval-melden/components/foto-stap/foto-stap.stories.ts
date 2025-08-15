import type { Meta, StoryObj } from '@storybook/angular';
import { signal } from '@angular/core';
import { FotoStapComponent } from './foto-stap.component';
import { MeldingsProcedureStatus } from '../../services/melding/melding-state.service';
import { FotoService } from '../../services/media/foto.service';
import { FotoMockService } from '../../services/media/foto-mock.service';

// Mock state service
const mockMeldingsProcedureStatus = {
    fotoUrl: signal(''),
    fotoDataUrl: signal(''),
    fotoBlob: signal(null),
    fotoError: signal(''),
    gaTerugNaarVorige: () => console.log('👈 Terug naar vorige stap'),
    gaNaarVolgende: () => console.log('👉 Naar volgende stap'),
    setFoto: (blob: Blob, dataUrl: string) => {
        console.log('📸 Foto ingesteld:', blob.size, 'bytes');
        mockMeldingsProcedureStatus.fotoBlob.set(blob);
        mockMeldingsProcedureStatus.fotoDataUrl.set(dataUrl);
    },
    setFotoError: (error: string) => {
        console.log('❌ Foto fout:', error);
        mockMeldingsProcedureStatus.fotoError.set(error);
    }
} as any;

const meta: Meta<FotoStapComponent> = {
    title: 'Components/Foto Stap',
    component: FotoStapComponent,
    parameters: {
        layout: 'fullscreen',
    },
    decorators: [
        (story, context) => ({
            template: `<div class="min-h-screen bg-surface-50 dark:bg-surface-950 p-4"><story-outlet></story-outlet></div>`,
            providers: [
                { provide: MeldingsProcedureStatus, useValue: mockMeldingsProcedureStatus },
                { provide: FotoService, useClass: FotoMockService }
            ]
        })
    ]
};

export default meta;
type Story = StoryObj<FotoStapComponent>;

export const Default: Story = {
    name: 'Standaard - Foto opties',
};

export const MetFoto: Story = {
    name: 'Met gemaakte foto',
    beforeEach: () => {
        mockMeldingsProcedureStatus.fotoUrl.set('https://picsum.photos/400/300');
    }
};

export const MetError: Story = {
    name: 'Met foutmelding',
    beforeEach: () => {
        mockMeldingsProcedureStatus.fotoError.set('Camera niet beschikbaar. Probeer opnieuw.');
    }
};

export const CameraActief: Story = {
    name: 'Camera actief',
    play: async ({ canvasElement }) => {
        // Simulate camera activation
        const component = canvasElement.querySelector('app-foto-stap') as any;
        if (component) {
            component.cameraActive.set(true);
        }
    }
};