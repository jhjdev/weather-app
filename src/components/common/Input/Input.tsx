import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
  Pressable,
} from 'react-native';
import {useThemedStyles} from '../../../styles/ThemeProvider';
import {Theme} from '../../../styles/theme';
import * as Icon from 'react-native-feather';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helper?: string;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  showPasswordToggle?: boolean;
}

export const Input = React.forwardRef<TextInput, InputProps>((
  {
    label,
    error,
    helper,
    variant = 'outlined',
    size = 'medium',
    leftIcon,
    rightIcon,
    containerStyle,
    inputStyle,
    showPasswordToggle = false,
    secureTextEntry,
    ...props
  },
  ref
) => {
  const styles = useThemedStyles(createStyles);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = secureTextEntry || showPasswordToggle;
  const shouldShowPassword = isPassword && !isPasswordVisible;

  const inputContainerStyle = [
    styles.inputContainer,
    styles[variant],
    styles[`${size}Container`],
    isFocused && styles.focused,
    error && styles.error,
    containerStyle,
  ];

  const textInputStyle = [
    styles.input,
    styles[`${size}Input`],
    leftIcon ? styles.inputWithLeftIcon : null,
    rightIcon || isPassword ? styles.inputWithRightIcon : null,
    inputStyle,
  ];

  const handlePasswordToggle = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={inputContainerStyle}>
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}

        <TextInput
          ref={ref}
          {...props}
          style={textInputStyle}
          secureTextEntry={shouldShowPassword}
          onFocus={e => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={e => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          placeholderTextColor={styles.placeholder.color}
          returnKeyType={props.returnKeyType || "next"}
          blurOnSubmit={false}
          enablesReturnKeyAutomatically
        />

        {isPassword && (
          <Pressable
            style={styles.rightIconContainer}
            onPress={handlePasswordToggle}>
            {isPasswordVisible ? (
              <Icon.EyeOff width={20} height={20} stroke={styles.icon.color} />
            ) : (
              <Icon.Eye width={20} height={20} stroke={styles.icon.color} />
            )}
          </Pressable>
        )}

        {rightIcon && !isPassword && (
          <View style={styles.rightIconContainer}>{rightIcon}</View>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
      {helper && !error && <Text style={styles.helperText}>{helper}</Text>}
    </View>
  );
});

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.md,
    },
    label: {
      fontSize: theme.typography.sizes.sm,
      fontWeight: theme.typography.weights.medium,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: theme.borderRadius.medium,
      backgroundColor: theme.colors.surface.primary,
    },

    // Variants
    default: {
      borderColor: theme.colors.border,
      backgroundColor: 'transparent',
    },
    outlined: {
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface.primary,
    },
    filled: {
      borderColor: 'transparent',
      backgroundColor: theme.colors.surface.secondary,
    },

    // States
    focused: {
      borderColor: theme.colors.primary,
      borderWidth: 2,
    },
    error: {
      borderColor: theme.colors.error,
      borderWidth: 2,
    },

    // Sizes
    smallContainer: {
      minHeight: 36,
      paddingHorizontal: theme.spacing.sm,
    },
    mediumContainer: {
      minHeight: 44,
      paddingHorizontal: theme.spacing.md,
    },
    largeContainer: {
      minHeight: 52,
      paddingHorizontal: theme.spacing.lg,
    },

    // Input styles
    input: {
      flex: 1,
      color: theme.colors.text.primary,
      fontWeight: theme.typography.weights.regular,
    },
    smallInput: {
      fontSize: theme.typography.sizes.sm,
    },
    mediumInput: {
      fontSize: theme.typography.sizes.base,
    },
    largeInput: {
      fontSize: theme.typography.sizes.lg,
    },

    inputWithLeftIcon: {
      marginLeft: theme.spacing.sm,
    },
    inputWithRightIcon: {
      marginRight: theme.spacing.sm,
    },

    // Icon containers
    leftIconContainer: {
      marginRight: theme.spacing.xs,
    },
    rightIconContainer: {
      marginLeft: theme.spacing.xs,
      padding: theme.spacing.xs,
    },

    // Helper texts
    errorText: {
      fontSize: theme.typography.sizes.xs,
      color: theme.colors.error,
      marginTop: theme.spacing.xs,
    },
    helperText: {
      fontSize: theme.typography.sizes.xs,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.xs,
    },

    // Style references for dynamic styles
    placeholder: {
      color: theme.colors.text.tertiary,
    },
    icon: {
      color: theme.colors.text.secondary,
    },
  });

export default Input;
