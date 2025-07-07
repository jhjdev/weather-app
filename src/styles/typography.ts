import { Platform } from 'react-native';

export interface TypographyTheme {
  fonts: {
    regular: string;
    medium: string;
    bold: string;
    light: string;
    mono: string;
  };
  sizes: {
    xs: number;
    sm: number;
    base: number;
    lg: number;
    xl: number;
    '2xl': number;
    '3xl': number;
    '4xl': number;
    '5xl': number;
  };
  lineHeights: {
    tight: number;
    normal: number;
    relaxed: number;
  };
  letterSpacing: {
    tight: number;
    normal: number;
    wide: number;
  };
  weights: {
    light: '300';
    regular: '400';
    medium: '500';
    semibold: '600';
    bold: '700';
  };
}

const systemFonts = Platform.select({
  ios: {
    regular: 'SF Pro Text',
    medium: 'SF Pro Text',
    bold: 'SF Pro Text',
    light: 'SF Pro Text',
    mono: 'SF Mono',
  },
  android: {
    regular: 'Roboto',
    medium: 'Roboto-Medium',
    bold: 'Roboto-Bold',
    light: 'Roboto-Light',
    mono: 'RobotoMono-Regular',
  },
  default: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    light: 'System',
    mono: 'monospace',
  },
});

export const typography: TypographyTheme = {
  fonts: systemFonts!,
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
  weights: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// Typography styles for common use cases
export const textStyles = {
  hero: {
    fontSize: typography.sizes['5xl'],
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.tight,
    letterSpacing: typography.letterSpacing.tight,
  },
  title: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.tight,
  },
  subtitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.semibold,
    lineHeight: typography.lineHeights.normal,
  },
  heading: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    lineHeight: typography.lineHeights.normal,
  },
  subheading: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
    lineHeight: typography.lineHeights.normal,
  },
  body: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.regular,
    lineHeight: typography.lineHeights.normal,
  },
  caption: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    lineHeight: typography.lineHeights.normal,
  },
  overline: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    lineHeight: typography.lineHeights.normal,
    letterSpacing: typography.letterSpacing.wide,
    textTransform: 'uppercase' as const,
  },
  button: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    lineHeight: typography.lineHeights.tight,
  },
  temperature: {
    fontSize: typography.sizes['4xl'],
    fontWeight: typography.weights.light,
    lineHeight: typography.lineHeights.tight,
    fontFamily: typography.fonts.light,
  },
  temperatureUnit: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.light,
    lineHeight: typography.lineHeights.tight,
  },
  weatherCondition: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.regular,
    lineHeight: typography.lineHeights.normal,
  },
  location: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    lineHeight: typography.lineHeights.normal,
  },
  data: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    lineHeight: typography.lineHeights.normal,
    fontFamily: typography.fonts.mono,
  },
};
