export interface SpacingTheme {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
  '4xl': number;
  '5xl': number;
  '6xl': number;
}

export const spacing: SpacingTheme = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 64,
  '5xl': 80,
  '6xl': 96,
};

// Common spacing patterns
export const spacingPatterns = {
  container: {
    padding: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  card: {
    padding: spacing.md,
    margin: spacing.sm,
    marginBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
  },
  listItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  button: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  input: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  weatherCard: {
    padding: spacing.lg,
    margin: spacing.sm,
    marginBottom: spacing.md,
  },
  forecast: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
  },
};
