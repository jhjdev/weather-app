import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { useThemedStyles } from '../../../styles/ThemeProvider';
import { Theme } from '../../../styles/theme';

export interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  size = 'medium',
  onPress,
  style,
  disabled = false,
}) => {
  const styles = useThemedStyles(createStyles);

  const cardStyle = [
    styles.base,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style,
  ];

  if (onPress && !disabled) {
    return (
      <Pressable
        style={({ pressed }) => [
          cardStyle,
          pressed && styles.pressed,
        ]}
        onPress={onPress}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const createStyles = (theme: Theme) => StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
  },
  default: {
    backgroundColor: theme.colors.card.background,
    ...theme.shadows.small,
  },
  elevated: {
    backgroundColor: theme.colors.surface.elevated,
    ...theme.shadows.medium,
  },
  outlined: {
    backgroundColor: theme.colors.surface.primary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  small: {
    padding: theme.spacing.sm,
  },
  medium: {
    padding: theme.spacing.md,
  },
  large: {
    padding: theme.spacing.lg,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Card;
