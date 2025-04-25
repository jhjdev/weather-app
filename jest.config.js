module.exports = {
  preset: 'react-native',

  // The root directory that Jest should scan for tests and modules
  rootDir: '.',

  // The test environment that will be used for testing
  testEnvironment: 'jsdom',

  // The glob patterns Jest uses to detect test files
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
  ],

  // Increase test timeout to avoid hanging tests
  testTimeout: 10000,

  // Run tests in parallel with limited concurrency
  maxWorkers: '50%',

  // Stop running tests after first failure for faster feedback
  bail: true,

  // An array of file extensions your modules use
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Transform files with babel-jest
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },

  // Module name mapper for handling assets and other file types
  moduleNameMapper: {
    // Handle image imports
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',

    // Handle module aliases
    '^@/(.*)$': '<rootDir>/src/$1',

    // Handle dotenv imports
    '\\.env': '<rootDir>/__mocks__/envMock.js',
  },

  // Ignore specific paths
  transformIgnorePatterns: [
    'node_modules/(?!(' +
      'react-native|' +
      '@react-native|' +
      'react-native-feather|' +
      'react-native-device-info|' +
      'react-native-haptic-feedback|' +
      'react-native-geolocation-service|' + // Added this module
      '@react-navigation|' +
      '@react-native-async-storage' +
    ')/)',
  ],

  // Setup files
  setupFiles: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/serviceWorker.ts',
  ],

  // Reset mocks before each test
  resetMocks: true,
  clearMocks: true,
};
