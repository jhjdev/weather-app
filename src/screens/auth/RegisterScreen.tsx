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
import {registerUser, clearError} from '../../store/slices/authSlice';
import {useThemedStyles} from '../../styles/ThemeProvider';
import {Theme} from '../../styles/theme';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import * as Icon from 'react-native-feather';

const RegisterScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const {isLoading, error} = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Show alert for auth errors
  useEffect(() => {
    if (error) {
      Alert.alert('Registration Failed', error.message);
    }
  }, [error]);

  const validateForm = (): boolean => {
    const errors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    };

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

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

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return (
      !errors.name &&
      !errors.email &&
      !errors.password &&
      !errors.confirmPassword
    );
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const result = await dispatch(
        registerUser({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      ).unwrap();

      Alert.alert('Registration Successful!', result.message, [
        {
          text: 'OK',
          onPress: () => navigation.navigate('EmailVerification' as never),
        },
      ]);
    } catch (registerError) {
      // Error is handled by useEffect above
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login' as never);
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Weather App to get started</Text>
          </View>

          <Card variant="elevated" style={styles.formCard}>
            <Input
              label="Full Name"
              value={formData.name}
              onChangeText={value => updateFormData('name', value)}
              error={formErrors.name}
              placeholder="Enter your full name"
              autoCapitalize="words"
              leftIcon={
                <Icon.User
                  width={20}
                  height={20}
                  stroke={styles.iconColor.color}
                />
              }
            />

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
              placeholder="Create a password"
              secureTextEntry
              showPasswordToggle
              leftIcon={
                <Icon.Lock
                  width={20}
                  height={20}
                  stroke={styles.iconColor.color}
                />
              }
              helper="Password must be at least 6 characters"
            />

            <Input
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={value => updateFormData('confirmPassword', value)}
              error={formErrors.confirmPassword}
              placeholder="Confirm your password"
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
              onPress={handleRegister}
              style={styles.registerButton}>
              Create Account
            </Button>
          </Card>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Button variant="ghost" size="medium" onPress={navigateToLogin}>
              Sign In
            </Button>
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
    registerButton: {
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
    iconColor: {
      color: theme.colors.text.secondary,
    },
  });

export default RegisterScreen;
