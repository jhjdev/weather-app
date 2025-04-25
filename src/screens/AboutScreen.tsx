import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import DeviceInfo from 'react-native-device-info';
import * as Icon from 'react-native-feather';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

import { RootState } from '../store';
import { setThemeMode, ThemeMode } from '../store/slices/themeSlice';
import { getColors, getSectionStyle } from '../theme';
import Header from '../components/common/Header';

interface DeviceDetails {
  deviceName: string;
  systemVersion: string;
  appVersion: string;
  buildNumber: string;
  screenWidth: number;
  screenHeight: number;
}

const AboutScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { mode, isDark } = useSelector((state: RootState) => state.theme);
  const colors = getColors(isDark);

  const [deviceDetails, setDeviceDetails] = useState<DeviceDetails>({
    deviceName: '',
    systemVersion: '',
    appVersion: '',
    buildNumber: '',
    screenWidth: 0,
    screenHeight: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDeviceInfo = async () => {
      try {
        setIsLoading(true);
        const deviceName = await DeviceInfo.getDeviceName();
        const systemVersion = DeviceInfo.getSystemVersion();
        const appVersion = DeviceInfo.getVersion();
        const buildNumber = DeviceInfo.getBuildNumber();
        const { width, height } = Dimensions.get('window');

        setDeviceDetails({
          deviceName,
          systemVersion,
          appVersion,
          buildNumber,
          screenWidth: width,
          screenHeight: height,
        });
      } catch (error) {
        console.error('Error loading device info:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDeviceInfo();
  }, []);

  const handleThemeChange = useCallback((newTheme: ThemeMode) => {
    ReactNativeHapticFeedback.trigger('selection', {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
    dispatch(setThemeMode(newTheme));
  }, [dispatch]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="About" />
      <ScrollView style={styles.scrollView}>
        <View
          style={getSectionStyle(isDark)}
          accessible={true}
          accessibilityLabel="Theme Settings"
        >
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Theme</Text>

          <TouchableOpacity
            style={[styles.optionContainer, { borderBottomColor: colors.divider }]}
            onPress={() => handleThemeChange('light')}
            accessible={true}
            accessibilityRole="radio"
            accessibilityState={{ checked: mode === 'light' }}
            accessibilityLabel={`Light Mode${mode === 'light' ? ', selected' : ''}`}
          >
            <Text style={[styles.optionLabel, { color: colors.text.primary }]}>Light Mode</Text>
            <View
              style={[
                styles.radioButton,
                { borderColor: colors.primary },
              ]}
            >
              {mode === 'light' && (
                <View style={[styles.radioButtonInner, { backgroundColor: colors.primary }]} />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionContainer, { borderBottomColor: colors.divider }]}
            onPress={() => handleThemeChange('dark')}
            accessible={true}
            accessibilityRole="radio"
            accessibilityState={{ checked: mode === 'dark' }}
            accessibilityLabel={`Dark Mode${mode === 'dark' ? ', selected' : ''}`}
          >
            <Text style={[styles.optionLabel, { color: colors.text.primary }]}>Dark Mode</Text>
            <View
              style={[
                styles.radioButton,
                { borderColor: colors.primary },
              ]}
            >
              {mode === 'dark' && (
                <View style={[styles.radioButtonInner, { backgroundColor: colors.primary }]} />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionContainer, { borderBottomWidth: 0 }]}
            onPress={() => handleThemeChange('system')}
            accessible={true}
            accessibilityRole="radio"
            accessibilityState={{ checked: mode === 'system' }}
            accessibilityLabel={`System Theme${mode === 'system' ? ', selected' : ''}`}
          >
            <Text style={[styles.optionLabel, { color: colors.text.primary }]}>System</Text>
            <View
              style={[
                styles.radioButton,
                { borderColor: colors.primary },
              ]}
            >
              {mode === 'system' && (
                <View style={[styles.radioButtonInner, { backgroundColor: colors.primary }]} />
              )}
            </View>
          </TouchableOpacity>
        </View>

        <View
          style={getSectionStyle(isDark)}
          accessible={true}
          accessibilityLabel="App Information"
        >
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>App Information</Text>

          <View style={[styles.infoRow, { borderBottomColor: colors.divider }]}>
            <Icon.Package
              stroke={colors.primary}
              width={20}
              height={20}
              style={styles.infoIcon}
            />
            <Text style={[styles.infoLabel, { color: colors.text.primary }]}>App Name</Text>
            <Text style={[styles.infoValue, { color: colors.text.secondary }]}>
              HostAway
            </Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: colors.divider }]}>
            <Icon.Info
              stroke={colors.primary}
              width={20}
              height={20}
              style={styles.infoIcon}
            />
            <Text style={[styles.infoLabel, { color: colors.text.primary }]}>App Version</Text>
            <Text style={[styles.infoValue, { color: colors.text.secondary }]}>
              {deviceDetails.appVersion}
            </Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: colors.divider }]}>
            <Icon.Package
              stroke={colors.primary}
              width={20}
              height={20}
              style={styles.infoIcon}
            />
            <Text style={[styles.infoLabel, { color: colors.text.primary }]}>Build Number</Text>
            <Text style={[styles.infoValue, { color: colors.text.secondary }]}>
              {deviceDetails.buildNumber}
            </Text>
          </View>

          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Icon.User
              stroke={colors.primary}
              width={20}
              height={20}
              style={styles.infoIcon}
            />
            <Text style={[styles.infoLabel, { color: colors.text.primary }]}>Author</Text>
            <Text style={[styles.infoValue, { color: colors.text.secondary }]}>
              Jon Hnefill Jakobsson
            </Text>
          </View>
        </View>

        <View
          style={getSectionStyle(isDark)}
          accessible={true}
          accessibilityLabel="Device Information"
        >
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Device Information</Text>

          {isLoading ? (
            <View style={[styles.infoRow, {
              justifyContent: 'center',
              borderBottomWidth: 0,
              paddingVertical: 24,  // Add more padding for better visual balance
            }]}>
              <ActivityIndicator
                color={colors.primary}
                size="small"  // Change to small for Material Design consistency
              />
            </View>
          ) : (
            <>
              <View style={[styles.infoRow, { borderBottomColor: colors.divider }]}>
            <Icon.Smartphone
              stroke={colors.primary}
              width={20}
              height={20}
              style={styles.infoIcon}
            />
            <Text style={[styles.infoLabel, { color: colors.text.primary }]}>Device</Text>
            <Text style={[styles.infoValue, { color: colors.text.secondary }]}>
              {deviceDetails.deviceName}
            </Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: colors.divider }]}>
            <Icon.Settings
              stroke={colors.primary}
              width={20}
              height={20}
              style={styles.infoIcon}
            />
            <Text style={[styles.infoLabel, { color: colors.text.primary }]}>System Version</Text>
            <Text style={[styles.infoValue, { color: colors.text.secondary }]}>
              {Platform.OS === 'ios' ? 'iOS' : 'Android'} {deviceDetails.systemVersion}
            </Text>
          </View>

          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Icon.Monitor
              stroke={colors.primary}
              width={20}
              height={20}
              style={styles.infoIcon}
            />
            <Text style={[styles.infoLabel, { color: colors.text.primary }]}>Screen Resolution</Text>
            <Text style={[styles.infoValue, { color: colors.text.secondary }]}>
              {deviceDetails.screenWidth} × {deviceDetails.screenHeight}
            </Text>
          </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  // section style removed - now using getSectionStyle directly
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    padding: 16,
    paddingBottom: 8,
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    // borderBottomColor set dynamically based on theme
  },
  optionLabel: {
    fontSize: 16,
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // radioButtonSelected no longer needed as we're using dynamic styles with colors.primary

  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    minHeight: 48,
  },
  infoIcon: {
    marginRight: 12,
    width: 20,
  },
  infoLabel: {
    fontSize: 16,
    marginRight: 8,
    minWidth: 100,  // Add minWidth to keep labels aligned
  },
  infoValue: {
    fontSize: 16,
    flex: 1,
    textAlign: 'right',
    flexWrap: 'wrap',  // Allow text to wrap
    flexShrink: 1,    // Allow text to shrink if needed
  },
});

export default AboutScreen;
