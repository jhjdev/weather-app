import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  TextInput,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {AppDispatch, RootState} from '../../store';
import {registerUser, verifyEmail, clearError} from '../../store/slices/authSlice';
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

  // Refs for field navigation
  const nameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

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

  // Keyboard event listeners for overlay behavior
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (event) => {
      // Get keyboard height
      const keyboardHeight = event.endCoordinates.height;
      
      // Scroll to focused field with keyboard overlay
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      // Maintain scroll position when keyboard hides
      // Don't auto-scroll to top to maintain user context
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

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

      Alert.alert('Registration & Verification Successful!', 
        'Your account has been created and automatically verified. You are now logged in. Welcome to the Weather App!'
      );
      // User is now automatically logged in, no navigation needed
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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="on-drag"
            bounces={true}
            automaticallyAdjustKeyboardInsets={false}
            automaticallyAdjustContentInsets={false}
            contentInsetAdjustmentBehavior="never">
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Weather App to get started</Text>
          </View>

          <Card variant="elevated" style={styles.formCard}>
            <Input
              ref={nameRef}
              label="Full Name"
              value={formData.name}
              onChangeText={value => updateFormData('name', value)}
              error={formErrors.name}
              placeholder="Enter your full name"
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              leftIcon={
                <Icon.User
                  width={20}
                  height={20}
                  stroke={styles.iconColor.color}
                />
              }
            />

            <Input
              ref={emailRef}
              label="Email Address"
              value={formData.email}
              onChangeText={value => updateFormData('email', value)}
              error={formErrors.email}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => {
                passwordRef.current?.focus();
                setTimeout(() => {
                  scrollViewRef.current?.scrollTo({ y: 150, animated: true });
                }, 50);
              }}
              leftIcon={
                <Icon.Mail
                  width={20}
                  height={20}
                  stroke={styles.iconColor.color}
                />
              }
            />

            <Input
              ref={passwordRef}
              label="Password"
              value={formData.password}
              onChangeText={value => updateFormData('password', value)}
              error={formErrors.password}
              placeholder="Create a password"
              secureTextEntry
              showPasswordToggle
              returnKeyType="next"
              onSubmitEditing={() => {
                confirmPasswordRef.current?.focus();
                setTimeout(() => {
                  scrollViewRef.current?.scrollTo({ y: 250, animated: true });
                }, 50);
              }}
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
              ref={confirmPasswordRef}
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={value => updateFormData('confirmPassword', value)}
              error={formErrors.confirmPassword}
              placeholder="Confirm your password"
              secureTextEntry
              showPasswordToggle
              returnKeyType="done"
              onSubmitEditing={handleRegister}
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
        </View>
      </TouchableWithoutFeedback>
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
      paddingBottom: Platform.OS === 'ios' ? 300 : 200, // Extra space for keyboard overlay
    },
    header: {
      alignItems: 'center',
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
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
      marginBottom: theme.spacing.lg,
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
    verificationSection: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    checkIcon: {
      marginBottom: theme.spacing.md,
    },
    verificationTitle: {
      fontSize: theme.typography.sizes['2xl'],
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
    },
    verificationMessage: {
      fontSize: theme.typography.sizes.base,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
      lineHeight: 24,
    },
    verificationInfo: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      fontStyle: 'italic',
    },
    verifyButton: {
      marginBottom: theme.spacing.md,
    },
    loginButton: {
      marginTop: theme.spacing.sm,
    },
    successColor: {
      color: theme.colors.success,
    },
  });

export default RegisterScreen;
