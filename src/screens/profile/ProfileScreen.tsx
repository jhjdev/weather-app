import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../store';
import {logoutUser, deleteProfile} from '../../store/slices/authSlice';
import {useThemedStyles, useTheme} from '../../styles/ThemeProvider';
import {Theme} from '../../styles/theme';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Header from '../../components/common/Header';
import * as Icon from 'react-native-feather';

const ProfileScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const {theme, toggleTheme, themeType} = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const {user, isLoading, error} = useSelector((state: RootState) => state.auth);

  const [preferences, setPreferences] = useState({
    temperatureUnit: 'celsius',
    weatherAlerts: true,
    dailyForecast: true,
  });

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          dispatch(logoutUser());
        },
      },
    ]);
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'Change password functionality coming soon!',
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. Are you sure you want to permanently delete your account?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteProfile()).unwrap();
              Alert.alert('Success', 'Your account has been deleted successfully.');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete account. Please try again.');
            }
          },
        },
      ],
    );
  };

  const togglePreference = (key: string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Profile" />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {/* User Info Card */}
        <Card variant="elevated" style={styles.card}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Icon.User
                  width={32}
                  height={32}
                  stroke={theme.colors.text.secondary}
                />
              </View>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              {user.isAdmin && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {user.isSuperAdmin ? 'SUPER ADMIN' : 'ADMIN'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Card>

        {/* App Settings */}
        <Card variant="elevated" style={styles.card}>
          <Text style={styles.sectionTitle}>App Settings</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon.Moon
                width={20}
                height={20}
                stroke={theme.colors.text.secondary}
              />
              <Text style={styles.settingLabel}>Dark Mode</Text>
            </View>
            <Switch
              value={themeType === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{
                false: theme.colors.surface.secondary,
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.surface.primary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon.Thermometer
                width={20}
                height={20}
                stroke={theme.colors.text.secondary}
              />
              <Text style={styles.settingLabel}>Temperature Unit</Text>
            </View>
            <Button
              variant="outline"
              size="small"
              onPress={() => {
                const newUnit =
                  preferences.temperatureUnit === 'celsius'
                    ? 'fahrenheit'
                    : 'celsius';
                setPreferences(prev => ({...prev, temperatureUnit: newUnit}));
              }}>
              {preferences.temperatureUnit === 'celsius' ? '°C' : '°F'}
            </Button>
          </View>
        </Card>

        {/* Notifications */}
        <Card variant="elevated" style={styles.card}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon.AlertTriangle
                width={20}
                height={20}
                stroke={theme.colors.text.secondary}
              />
              <Text style={styles.settingLabel}>Weather Alerts</Text>
            </View>
            <Switch
              value={preferences.weatherAlerts}
              onValueChange={() => togglePreference('weatherAlerts')}
              trackColor={{
                false: theme.colors.surface.secondary,
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.surface.primary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon.Calendar
                width={20}
                height={20}
                stroke={theme.colors.text.secondary}
              />
              <Text style={styles.settingLabel}>Daily Forecast</Text>
            </View>
            <Switch
              value={preferences.dailyForecast}
              onValueChange={() => togglePreference('dailyForecast')}
              trackColor={{
                false: theme.colors.surface.secondary,
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.surface.primary}
            />
          </View>
        </Card>

        {/* Account Actions */}
        <Card variant="elevated" style={styles.card}>
          <Text style={styles.sectionTitle}>Account</Text>

          <Button
            variant="outline"
            size="large"
            fullWidth
            onPress={handleChangePassword}
            style={styles.actionButton}>
            Change Password
          </Button>

          <Button
            variant="danger"
            size="large"
            fullWidth
            onPress={handleDeleteAccount}
            style={styles.actionButton}>
            Delete Account
          </Button>
        </Card>

        {/* Logout Button */}
        <Card variant="elevated" style={styles.card}>
          <Button
            variant="outline"
            size="large"
            fullWidth
            loading={isLoading}
            onPress={handleLogout}>
            Logout
          </Button>
        </Card>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Weather App v1.0.0</Text>
          <Text style={styles.appInfoText}>Built with React Native</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    scrollView: {
      flex: 1,
      padding: theme.spacing.md,
    },
    card: {
      marginBottom: theme.spacing.md,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatarContainer: {
      marginRight: theme.spacing.md,
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.colors.surface.secondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarIcon: {
      color: theme.colors.text.secondary,
    },
    userDetails: {
      flex: 1,
    },
    userName: {
      fontSize: theme.typography.sizes.xl,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    userEmail: {
      fontSize: theme.typography.sizes.base,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.xs,
    },
    badge: {
      alignSelf: 'flex-start',
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.small,
    },
    badgeText: {
      fontSize: theme.typography.sizes.xs,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text.inverse,
    },
    sectionTitle: {
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.semibold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },
    settingInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    settingLabel: {
      fontSize: theme.typography.sizes.base,
      color: theme.colors.text.primary,
      marginLeft: theme.spacing.sm,
    },
    actionButton: {
      marginBottom: theme.spacing.sm,
    },
    appInfo: {
      alignItems: 'center',
      paddingVertical: theme.spacing.lg,
    },
    appInfoText: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text.tertiary,
      marginBottom: theme.spacing.xs,
    },
  });

export default ProfileScreen;
