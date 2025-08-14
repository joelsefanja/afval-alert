import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
  ],
  framework: {
    name: '@storybook/angular',
    options: {
      builder: {
        useSWC: false,
      },
    },
  },
  staticDirs: ['../src/assets'],
  typescript: {
    check: true,
  },
  core: {
    disableTelemetry: true,
    builder: '@storybook/builder-webpack5',
  },
};

export default config;