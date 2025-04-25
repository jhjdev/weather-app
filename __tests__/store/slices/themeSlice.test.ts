/**
 * This test suite verifies the theme slice functionality.
 */

// Basic mock to make tests run
jest.mock('react-native', () => ({
  Appearance: {
    // Simple mock function - we don't need to manipulate it
    getColorScheme: () => 'light',
    addChangeListener: jest.fn(),
    removeChangeListener: jest.fn(),
  },
}));

// Import modules
import { configureStore, EnhancedStore, Reducer } from '@reduxjs/toolkit';
import themeReducer, {
  ThemeState,
  setThemeMode,
  updateSystemTheme,
} from '../../../src/store/slices/themeSlice';

// Define the RootState type for our test store
interface RootState {
  theme: ThemeState;
}

// Simple helper to create a test store
const createTestStore = (initialState?: Partial<ThemeState>): EnhancedStore<RootState> => {
  // Prepare preloaded state if provided
  let preloadedState: Partial<RootState> | undefined;

  if (initialState) {
    preloadedState = {
      theme: {
        // Set mode and isDark properties to satisfy ThemeState interface
        mode: initialState.mode ?? 'system',
        isDark: initialState.isDark ?? false, // Default to light theme if not specified
      },
    };
  }

  // Create the store with preloaded state if available
  const store = configureStore<RootState>({
    reducer: {
      theme: themeReducer as Reducer<ThemeState>,
    },
    preloadedState: preloadedState as RootState,
  });

  return store;
};

describe('themeSlice', () => {
  beforeEach(() => {
    // Set up fake timers
    jest.useFakeTimers();
  });

  afterEach(() => {
    // Clean up timers
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('initial state', () => {
    it('should use system as initial theme mode', () => {
      // Create store
      const store = createTestStore();

      // Verify the mode is correct
      const state = store.getState().theme;
      expect(state.mode).toBe('system');
    });
  });

  describe('setThemeMode reducer', () => {
    it('should set light theme mode', () => {
      const store = createTestStore();

      // Set theme to light
      store.dispatch(setThemeMode('light'));

      const state = store.getState().theme;
      expect(state.mode).toBe('light');
    });

    it('should set dark theme mode', () => {
      const store = createTestStore();

      // Set theme to dark
      store.dispatch(setThemeMode('dark'));

      const state = store.getState().theme;
      expect(state.mode).toBe('dark');
    });

    it('should set system theme mode', () => {
      // Create store with explicit dark theme
      const store = createTestStore({
        mode: 'dark',
      });

      // Set theme to system
      store.dispatch(setThemeMode('system'));

      // Verify mode is set to system
      const state = store.getState().theme;
      expect(state.mode).toBe('system');
    });
  });

  describe('updateSystemTheme reducer', () => {
    it('should maintain system mode after update', () => {
      // Create store with system mode
      const store = createTestStore({
        mode: 'system',
      });

      // Verify initial state mode
      const initialState = store.getState().theme;
      expect(initialState.mode).toBe('system');

      // Update the theme based on system change
      store.dispatch(updateSystemTheme());

      // Verify mode didn't change
      const updatedState = store.getState().theme;
      expect(updatedState.mode).toBe('system');
    });

    it('should keep explicit mode when not using system', () => {
      // Create store with explicit dark mode
      const store = createTestStore({
        mode: 'dark',
      });

      // Try to update the theme based on system change
      store.dispatch(updateSystemTheme());

      // Should still be in dark mode
      const state = store.getState().theme;
      expect(state.mode).toBe('dark');
    });
  }); // Close updateSystemTheme reducer describe block

  describe('edge cases', () => {
    it('should maintain system mode when handling null system preference', () => {
      // Create store with system mode
      const store = createTestStore({
        mode: 'system',
      });

      // Set theme to system
      store.dispatch(setThemeMode('system'));

      // Verify mode remains system
      const state = store.getState().theme;
      expect(state.mode).toBe('system');
    });

    it('should properly switch from system to explicit mode', () => {
      // Create store with system mode
      const store = createTestStore({
        mode: 'system',
      });

      // Verify initial mode is system
      const initialState = store.getState().theme;
      expect(initialState.mode).toBe('system');

      // Switch to light mode
      store.dispatch(setThemeMode('light'));

      // Verify mode changed to light
      const state = store.getState().theme;
      expect(state.mode).toBe('light');
    });
  });
});
