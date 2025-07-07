import React, {ReactNode} from 'react';
import {
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import {useThemedStyles, useTheme} from '../../../styles/ThemeProvider';
import {Theme} from '../../../styles/theme';

export interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  onPress,
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const styles = useThemedStyles(createStyles);
  const theme = useTheme();

  const isDisabled = disabled || loading;

  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[`${size}Button`],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    isDisabled && styles.disabledText,
    textStyle,
  ];

  return (
    <Pressable
      style={({pressed}) => [
        buttonStyle,
        pressed && !isDisabled && styles.pressed,
      ]}
      onPress={onPress}
      disabled={isDisabled}>
      {loading && (
        <ActivityIndicator
          size="small"
          color={
            variant === 'primary'
              ? theme.theme.colors.text.inverse
              : theme.theme.colors.primary
          }
          style={styles.loader}
        />
      )}
      <Text style={textStyles}>{children}</Text>
    </Pressable>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    base: {
      borderRadius: theme.borderRadius.medium,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      minHeight: 44,
    },
    fullWidth: {
      width: '100%',
    },

    // Variants
    primary: {
      backgroundColor: theme.colors.primary,
      ...theme.shadows.small,
    },
    secondary: {
      backgroundColor: theme.colors.secondary,
      ...theme.shadows.small,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    danger: {
      backgroundColor: theme.colors.error,
      ...theme.shadows.small,
    },

    // Sizes
    smallButton: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      minHeight: 36,
    },
    mediumButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      minHeight: 44,
    },
    largeButton: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      minHeight: 52,
    },

    // Text styles
    text: {
      fontWeight: theme.typography.weights.semibold,
      textAlign: 'center',
    },
    primaryText: {
      color: theme.colors.text.inverse,
    },
    secondaryText: {
      color: theme.colors.text.inverse,
    },
    outlineText: {
      color: theme.colors.primary,
    },
    ghostText: {
      color: theme.colors.primary,
    },
    dangerText: {
      color: theme.colors.text.inverse,
    },

    // Text sizes
    smallText: {
      fontSize: theme.typography.sizes.sm,
    },
    mediumText: {
      fontSize: theme.typography.sizes.base,
    },
    largeText: {
      fontSize: theme.typography.sizes.lg,
    },

    // States
    pressed: {
      opacity: 0.8,
      transform: [{scale: 0.98}],
    },
    disabled: {
      opacity: 0.5,
    },
    disabledText: {
      opacity: 0.7,
    },
    loader: {
      marginRight: theme.spacing.xs,
    },
  });

export default Button;
