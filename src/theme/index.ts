import { getColors } from './colors';
export * from './colors';

// Theme-related utility functions
export const getStatusBarStyle = (isDark: boolean) =>
  isDark ? 'light-content' : 'dark-content';

// Common shadow styles
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

// Common section styles
export const getSectionStyle = (isDark: boolean) => ({
  ...getShadowStyle(isDark),
  borderRadius: 8,
  margin: 16,
  backgroundColor: getColors(isDark).surface,
});

