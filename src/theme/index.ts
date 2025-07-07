// Re-export from new styles system
export * from '../styles/colors';
export * from '../styles/typography';
export * from '../styles/spacing';
export * from '../styles/theme';

// Legacy support - will be removed after migration
import { getColors } from '../styles/colors';

// Theme-related utility functions
export const getStatusBarStyle = (isDark: boolean) =>
  isDark ? 'light-content' : 'dark-content';

// Common shadow styles - deprecated, use theme.shadows instead
export const getShadowStyle = (isDark: boolean) => ({
  shadowColor: isDark ? '#000000' : '#000000',
  shadowOffset: {
    width: 0,
    height: 1,
  },
  shadowOpacity: isDark ? 0.2 : 0.15,
  shadowRadius: 2,
  elevation: 2,
});

// Common section styles - deprecated, use styled components instead
export const getSectionStyle = (isDark: boolean) => ({
  ...getShadowStyle(isDark),
  borderRadius: 8,
  margin: 16,
  backgroundColor: getColors(isDark).surface.primary,
});

