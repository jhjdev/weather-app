import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, SafeAreaView, Alert} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {AppDispatch, RootState} from '../../store';
import {
  verifyEmail,
  resendVerification,
  clearError,
} from '../../store/slices/authSlice';
import {useThemedStyles} from '../../styles/ThemeProvider';
import {Theme} from '../../styles/theme';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import * as Icon from 'react-native-feather';

const EmailVerificationScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const {isLoading, error, pendingVerification} = useSelector(
    (state: RootState) => state.auth,
  );

  const [verificationCode, setVerificationCode] = useState('');
  const [codeError, setCodeError] = useState('');

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Show alert for auth errors
  useEffect(() => {
    if (error) {
      Alert.alert('Verification Failed', error.message);
    }
  }, [error]);

  // Redirect if no pending verification
  useEffect(() => {
    if (!pendingVerification) {
      navigation.navigate('Login' as never);
    }
  }, [pendingVerification, navigation]);

  const validateCode = (): boolean => {
    if (!verificationCode.trim()) {
      setCodeError('Verification code is required');
      return false;
    }

    if (verificationCode.length !== 6) {
      setCodeError('Verification code must be 6 digits');
      return false;
    }

    if (!/^\d{6}$/.test(verificationCode)) {
      setCodeError('Verification code must contain only numbers');
      return false;
    }

    setCodeError('');
    return true;
  };

  const handleVerifyEmail = async () => {
    if (!validateCode() || !pendingVerification) {
      return;
    }

    try {
      await dispatch(
        verifyEmail({
          email: pendingVerification,
          code: verificationCode.trim(),
        }),
      ).unwrap();

      Alert.alert(
        'Email Verified!',
        'Your email has been successfully verified. Welcome to Weather App!',
        [
          {
            text: 'Continue',
            onPress: () => {
              // Navigation will be handled by the main app based on auth state
            },
          },
        ],
      );
    } catch (verificationError) {
      // Error is handled by useEffect above
    }
  };

  const handleResendCode = async () => {
    if (!pendingVerification) {
      return;
    }

    try {
      const result = await dispatch(
        resendVerification(pendingVerification),
      ).unwrap();
      Alert.alert('Code Sent', result.message);
    } catch (resendError: any) {
      Alert.alert(
        'Resend Failed',
        resendError.message || 'Failed to resend verification code',
      );
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login' as never);
  };

  const handleCodeChange = (value: string) => {
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/[^0-9]/g, '').slice(0, 6);
    setVerificationCode(numericValue);

    // Clear error when user starts typing
    if (codeError) {
      setCodeError('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Icon.Mail width={48} height={48} stroke={styles.iconColor.color} />
          </View>
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>We've sent a verification code to</Text>
          <Text style={styles.email}>{pendingVerification}</Text>
        </View>

        <Card variant="elevated" style={styles.formCard}>
          <Input
            label="Verification Code"
            value={verificationCode}
            onChangeText={handleCodeChange}
            error={codeError}
            placeholder="Enter 6-digit code"
            keyboardType="number-pad"
            textAlign="center"
            maxLength={6}
            inputStyle={styles.codeInput}
            helper="Check your email for the 6-digit verification code"
          />

          <Button
            variant="primary"
            size="large"
            fullWidth
            loading={isLoading}
            onPress={handleVerifyEmail}
            style={styles.verifyButton}>
            Verify Email
          </Button>

          <View style={styles.resendSection}>
            <Text style={styles.resendText}>Didn't receive the code?</Text>
            <Button
              variant="ghost"
              size="medium"
              onPress={handleResendCode}
              disabled={isLoading}>
              Resend Code
            </Button>
          </View>
        </Card>

        <View style={styles.footer}>
          <Button variant="outline" size="medium" onPress={navigateToLogin}>
            Back to Login
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    content: {
      flex: 1,
      padding: theme.spacing.lg,
      justifyContent: 'center',
    },
    header: {
      alignItems: 'center',
      marginBottom: theme.spacing['3xl'],
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.surface.secondary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.lg,
    },
    title: {
      fontSize: theme.typography.sizes['3xl'],
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: theme.typography.sizes.base,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginBottom: theme.spacing.xs,
    },
    email: {
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.semibold,
      color: theme.colors.primary,
      textAlign: 'center',
    },
    formCard: {
      marginBottom: theme.spacing.xl,
    },
    codeInput: {
      fontSize: theme.typography.sizes['2xl'],
      fontWeight: theme.typography.weights.bold,
      letterSpacing: 8,
    },
    verifyButton: {
      marginTop: theme.spacing.md,
    },
    resendSection: {
      alignItems: 'center',
      marginTop: theme.spacing.lg,
    },
    resendText: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.xs,
    },
    footer: {
      alignItems: 'center',
    },
    iconColor: {
      color: theme.colors.primary,
    },
  });

export default EmailVerificationScreen;
