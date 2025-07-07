import { ColorScheme } from './colors';
import { TypographyTheme } from './typography';
import { SpacingTheme } from './spacing';

export interface Theme {
  colors: ColorScheme;
  typography: TypographyTheme;
  spacing: SpacingTheme;
  borderRadius: {
    small: number;
    medium: number;
    large: number;
    extraLarge: number;
  };
  shadows: {
    small: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    medium: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    large: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
  };
  animations: {
    timing: {
      fast: number;
      normal: number;
      slow: number;
    };
    easing: {
      easeInOut: string;
      easeIn: string;
      easeOut: string;
    };
  };
}

export const createTheme = (colors: ColorScheme, typography: TypographyTheme, spacing: SpacingTheme): Theme => ({
  colors,
  typography,
  spacing,
  borderRadius: {
    small: 4,
    medium: 8,
    large: 16,
    extraLarge: 24,
  },
  shadows: {
    small: {
      shadowColor: colors.card.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: colors.card.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    large: {
      shadowColor: colors.card.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
  },
  animations: {
    timing: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    },
  },
});

export type ThemeType = 'light' | 'dark';
