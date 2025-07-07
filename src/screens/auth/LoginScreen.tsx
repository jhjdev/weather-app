import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {AppDispatch, RootState} from '../../store';
import {loginUser, clearError} from '../../store/slices/authSlice';
import {useThemedStyles} from '../../styles/ThemeProvider';
import {Theme} from '../../styles/theme';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import * as Icon from 'react-native-feather';

const LoginScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const {isLoading, error} = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
  });

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Show alert for auth errors
  useEffect(() => {
    if (error) {
      Alert.alert('Login Failed', error.message);
    }
  }, [error]);

  const validateForm = (): boolean => {
    const errors = {
      email: '',
      password: '',
    };

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errors);
    return !errors.email && !errors.password;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(
        loginUser({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      ).unwrap();

      // Navigation will be handled by the main app based on auth state
    } catch (loginError) {
      // Error is handled by useEffect above
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('Register' as never);
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
    // Clear field error when user starts typing
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors(prev => ({...prev, [field]: ''}));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to continue to Weather App
            </Text>
          </View>

          <Card variant="elevated" style={styles.formCard}>
            <Input
              label="Email Address"
              value={formData.email}
              onChangeText={value => updateFormData('email', value)}
              error={formErrors.email}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon={
                <Icon.Mail
                  width={20}
                  height={20}
                  stroke={styles.iconColor.color}
                />
              }
            />

            <Input
              label="Password"
              value={formData.password}
              onChangeText={value => updateFormData('password', value)}
              error={formErrors.password}
              placeholder="Enter your password"
              secureTextEntry
              showPasswordToggle
              leftIcon={
                <Icon.Lock
                  width={20}
                  height={20}
                  stroke={styles.iconColor.color}
                />
              }
            />

            <Button
              variant="primary"
              size="large"
              fullWidth
              loading={isLoading}
              onPress={handleLogin}
              style={styles.loginButton}>
              Sign In
            </Button>
          </Card>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Button variant="ghost" size="medium" onPress={navigateToRegister}>
              Sign Up
            </Button>
          </View>

          <View style={styles.adminHint}>
            <Text style={styles.adminText}>
              Demo Admin: jhj@jhjdev.com / admin123
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    keyboardAvoid: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      padding: theme.spacing.lg,
      justifyContent: 'center',
    },
    header: {
      alignItems: 'center',
      marginBottom: theme.spacing['3xl'],
    },
    title: {
      fontSize: theme.typography.sizes['4xl'],
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: theme.typography.sizes.lg,
      color: theme.colors.text.secondary,
      textAlign: 'center',
    },
    formCard: {
      marginBottom: theme.spacing.xl,
    },
    loginButton: {
      marginTop: theme.spacing.md,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    footerText: {
      fontSize: theme.typography.sizes.base,
      color: theme.colors.text.secondary,
    },
    adminHint: {
      marginTop: theme.spacing.xl,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface.secondary,
      borderRadius: theme.borderRadius.medium,
      alignItems: 'center',
    },
    adminText: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text.tertiary,
      textAlign: 'center',
    },
    iconColor: {
      color: theme.colors.text.secondary,
    },
  });

export default LoginScreen;
