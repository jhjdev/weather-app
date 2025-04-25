import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Appearance } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeState {
  mode: ThemeMode;
  // Computed theme based on system setting and user preference
  isDark: boolean;
}

const initialState: ThemeState = {
  mode: 'system',
  isDark: Appearance.getColorScheme() === 'dark',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
      state.isDark = action.payload === 'system'
        ? Appearance.getColorScheme() === 'dark'
        : action.payload === 'dark';
    },
    updateSystemTheme: (state) => {
      if (state.mode === 'system') {
        state.isDark = Appearance.getColorScheme() === 'dark';
      }
    },
  },
});

export const { setThemeMode, updateSystemTheme } = themeSlice.actions;
export default themeSlice.reducer;

