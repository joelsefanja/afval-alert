export default {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jsdom',
  rootDir: './../../',
  testMatch: [
    '<rootDir>/tests/**/*.spec.ts',
    '<rootDir>/src/**/*.spec.ts'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/tests/e2e/',
  ],
  transform: {
    '^.+\\.(ts|js|html): ['jest-preset-angular', {
      tsconfig: '<rootDir>/tests/config/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.html,
    }],
  },
  moduleNameMapper: {
    '^@app/(.*): '<rootDir>/src/app/$1',
    '^@models/(.*): '<rootDir>/src/app/models/$1',
    '^@models: '<rootDir>/src/app/models',
    '^@shared/(.*): '<rootDir>/src/app/shared/$1',
    '^@environments/(.*): '<rootDir>/environments/$1',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/main.ts',
    '!src/polyfills.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'text-summary'],
};