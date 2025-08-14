import type { Meta, StoryObj } from '@storybook/angular';
import { OfflineNotificatieComponent } from './offline-notificatie.component';

const meta: Meta<OfflineNotificatieComponent> = {
  title: 'Components/Afval Melden/OfflineNotificatie',
  component: OfflineNotificatieComponent,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A notification component that appears when the user is offline. It slides up from the bottom and informs the user that their report will be saved and sent when they are back online.'
      },
    },
    backgrounds: {
      default: 'light',
    },
  },
  tags: ['autodocs'],
  argTypes: {
    isOffline: {
      control: 'boolean',
      description: 'Controls whether the offline notification is shown',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
  },
  args: {
    isOffline: false,
  },
};

export default meta;
type Story = StoryObj<OfflineNotificatieComponent>;

export const Hidden: Story = {
  args: {
    isOffline: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'The notification when the user is online (hidden state). The component is present but invisible.',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="min-h-screen bg-gray-100 p-8">
        <div class="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
          <h2 class="text-lg font-semibold mb-4">Online State</h2>
          <p class="text-gray-600 mb-4">The user is online. No notification is shown.</p>
          <div class="space-y-2">
            <div class="h-4 bg-gray-200 rounded"></div>
            <div class="h-4 bg-gray-200 rounded w-2/3"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <app-offline-notificatie [isOffline]="isOffline" />
      </div>
    `,
  }),
};

export const Visible: Story = {
  args: {
    isOffline: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'The notification when the user is offline (visible state). Shows an amber-colored notification at the bottom with a slide-up animation.',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="min-h-screen bg-gray-100 p-8">
        <div class="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
          <h2 class="text-lg font-semibold mb-4">Offline State</h2>
          <p class="text-gray-600 mb-4">The user is offline. The notification appears at the bottom.</p>
          <div class="space-y-2">
            <div class="h-4 bg-gray-200 rounded"></div>
            <div class="h-4 bg-gray-200 rounded w-2/3"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <app-offline-notificatie [isOffline]="isOffline" />
      </div>
    `,
  }),
};

export const InteractiveDemo: Story = {
  args: {
    isOffline: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo with a toggle button to simulate going online/offline. Click the button to see the notification slide in and out.',
      },
    },
  },
  render: (args) => ({
    props: {
      ...args,
      toggleOffline: function() {
        this['isOffline'] = !this['isOffline'];
      }
    },
    template: `
      <div class="min-h-screen bg-gray-100 p-8">
        <div class="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
          <h2 class="text-lg font-semibold mb-4">Interactive Demo</h2>
          <p class="text-gray-600 mb-4">
            Current status: <span class="font-medium" [class]="isOffline ? 'text-red-600' : 'text-green-600'">
              {{ isOffline ? 'Offline' : 'Online' }}
            </span>
          </p>
          <button 
            (click)="toggleOffline()"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            {{ isOffline ? 'Go Online' : 'Go Offline' }}
          </button>
          <div class="mt-6 space-y-2">
            <div class="h-4 bg-gray-200 rounded"></div>
            <div class="h-4 bg-gray-200 rounded w-2/3"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <app-offline-notificatie [isOffline]="isOffline" />
      </div>
    `,
  }),
};

export const MobileView: Story = {
  args: {
    isOffline: true,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile2',
    },
    docs: {
      description: {
        story: 'How the notification looks on mobile devices. The notification is responsive and adjusts to smaller screens.',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="min-h-screen bg-gray-100 p-4">
        <div class="bg-white p-4 rounded-lg shadow">
          <h1 class="text-xl font-bold mb-2">Afval Melden</h1>
          <p class="text-gray-600 text-sm mb-4">Vul het formulier in om zwerfafval te melden</p>
          
          <form class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Locatie</label>
              <input type="text" class="w-full p-2 border border-gray-300 rounded text-sm" placeholder="Bijv. Hoofdstraat 123">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Type afval</label>
              <select class="w-full p-2 border border-gray-300 rounded text-sm">
                <option>Selecteer type afval</option>
                <option>Plastic</option>
                <option>Papier</option>
                <option>Glas</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Beschrijving</label>
              <textarea class="w-full p-2 border border-gray-300 rounded text-sm h-20" placeholder="Beschrijf het afval..."></textarea>
            </div>
          </form>
        </div>
        <app-offline-notificatie [isOffline]="isOffline" />
      </div>
    `,
  }),
};

export const WithCustomBackground: Story = {
  args: {
    isOffline: true,
  },
  parameters: {
    backgrounds: {
      default: 'dark',
    },
    docs: {
      description: {
        story: 'The notification on a dark background to show contrast and visibility.',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="min-h-screen bg-gray-900 p-8">
        <div class="max-w-md mx-auto bg-gray-800 p-6 rounded-lg shadow-xl">
          <h2 class="text-lg font-semibold mb-4 text-white">Dark Mode</h2>
          <p class="text-gray-300 mb-4">The offline notification stands out against dark backgrounds too.</p>
          <div class="space-y-2">
            <div class="h-4 bg-gray-700 rounded"></div>
            <div class="h-4 bg-gray-700 rounded w-2/3"></div>
            <div class="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
        <app-offline-notificatie [isOffline]="isOffline" />
      </div>
    `,
  }),
};