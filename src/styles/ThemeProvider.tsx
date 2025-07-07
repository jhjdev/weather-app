import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { Theme, createTheme, ThemeType } from './theme';
import { lightColors, darkColors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';

interface ThemeContextType {
  theme: Theme;
  themeType: ThemeType;
  toggleTheme: () => void;
  setTheme: (themeType: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: ThemeType;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme,
}) => {
  const [themeType, setThemeType] = useState<ThemeType>(() => {
    if (initialTheme) {return initialTheme;}

    const systemTheme = Appearance.getColorScheme();
    return systemTheme === 'dark' ? 'dark' : 'light';
  });

  const theme = createTheme(
    themeType === 'dark' ? darkColors : lightColors,
    typography,
    spacing
  );

  const toggleTheme = () => {
    setThemeType(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setTheme = (newThemeType: ThemeType) => {
    setThemeType(newThemeType);
  };

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }: { colorScheme: ColorSchemeName }) => {
      if (colorScheme) {
        setThemeType(colorScheme === 'dark' ? 'dark' : 'light');
      }
    });

    return () => subscription?.remove();
  }, []);

  const contextValue: ThemeContextType = {
    theme,
    themeType,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Hook for creating styles that depend on theme
export const useThemedStyles = <T extends Record<string, any>>(
  styleCreator: (theme: Theme) => T
): T => {
  const { theme } = useTheme();
  return styleCreator(theme);
};
