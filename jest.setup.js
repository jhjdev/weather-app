/**
 * jest.setup.js
 *
 * This file contains all the Jest setup configuration and mock implementations
 * needed for testing React Native applications. It provides comprehensive mocks
 * for native modules, third-party libraries, and React Native components.
 */

const {jest} = require('@jest/globals');
const fs = require('fs');
const path = require('path');

// ============================================================
// 0. Test Environment Setup
// ============================================================

// Set up necessary globals and timeouts early
global.__DEV__ = true;
global.mockDelay = 10;

// Create necessary mock files directory if it doesn't exist
const mockDir = path.join(__dirname, '__mocks__');
if (!fs.existsSync(mockDir)) {
  fs.mkdirSync(mockDir, {recursive: true});
}

// Create fileMock.js if it doesn't exist
const fileMockPath = path.join(mockDir, 'fileMock.js');
if (!fs.existsSync(fileMockPath)) {
  fs.writeFileSync(fileMockPath, 'module.exports = "test-file-stub";');
}

// Create envMock.js if it doesn't exist
const envMockPath = path.join(mockDir, 'envMock.js');
if (!fs.existsSync(envMockPath)) {
  fs.writeFileSync(envMockPath, 'module.exports = {};');
}

// ============================================================
// 1. React Native Core Mocks
// ============================================================

/**
 * Comprehensive React Native mock implementation for Jest
 * This mocks all the native modules and APIs used in the application
 */
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');

  // Mock the Platform API
  RN.Platform = {
    ...RN.Platform,
    OS: 'ios',
    Version: 14,
    isPad: false,
    isTVOS: false,
    isTV: false,
    constants: {
      reactNativeVersion: {major: 0, minor: 71, patch: 0},
    },
    select: jest.fn(obj => obj.ios || obj.default),
  };

  // Mock the Dimensions API
  const dimensions = {width: 375, height: 812, scale: 3, fontScale: 1};
  RN.Dimensions = {
    ...RN.Dimensions,
    get: jest.fn(screen =>
      screen === 'window' || screen === 'screen' ? dimensions : null,
    ),
    set: jest.fn(),
    addEventListener: jest.fn(() => ({remove: jest.fn()})),
    removeEventListener: jest.fn(),
  };

  // Mock the Appearance API
  let colorScheme = 'light';
  RN.Appearance = {
    ...RN.Appearance,
    getColorScheme: jest.fn(() => colorScheme),
    addChangeListener: jest.fn(cb => ({remove: jest.fn()})),
    removeChangeListener: jest.fn(),
    setColorScheme: mockScheme => {
      colorScheme = mockScheme;
      return jest.fn();
    },
  };

  // Mock the Animated API
  RN.Animated = {
    ...RN.Animated,
    timing: jest.fn(() => ({
      start: jest.fn(cb => cb && cb({finished: true})),
      stop: jest.fn(),
      reset: jest.fn(),
    })),
    spring: jest.fn(() => ({
      start: jest.fn(cb => cb && cb({finished: true})),
      stop: jest.fn(),
      reset: jest.fn(),
    })),
    decay: jest.fn(() => ({
      start: jest.fn(cb => cb && cb({finished: true})),
      stop: jest.fn(),
    })),
    Value: jest.fn(value => ({
      setValue: jest.fn(),
      setOffset: jest.fn(),
      interpolate: jest.fn(() => ({
        __getValue: jest.fn(() => value),
      })),
      __getValue: jest.fn(() => value),
      addListener: jest.fn(() => ({remove: jest.fn()})),
      removeListener: jest.fn(),
      removeAllListeners: jest.fn(),
      stopAnimation: jest.fn(callback => callback && callback(value)),
    })),
    ValueXY: jest.fn(() => ({
      x: new RN.Animated.Value(0),
      y: new RN.Animated.Value(0),
      setValue: jest.fn(),
      setOffset: jest.fn(),
      flattenOffset: jest.fn(),
      addListener: jest.fn(() => ({remove: jest.fn()})),
      removeListener: jest.fn(),
      removeAllListeners: jest.fn(),
      stopAnimation: jest.fn(callback => callback && callback({x: 0, y: 0})),
      getLayout: jest.fn(() => ({left: 0, top: 0})),
    })),
    loop: jest.fn(animation => animation),
    sequence: jest.fn(animations => ({
      start: jest.fn(cb => cb && cb({finished: true})),
    })),
    parallel: jest.fn(animations => ({
      start: jest.fn(cb => cb && cb({finished: true})),
    })),
    stagger: jest.fn((delay, animations) => ({
      start: jest.fn(cb => cb && cb({finished: true})),
    })),
    delay: jest.fn(delayMS => ({
      start: jest.fn(cb => cb && cb({finished: true})),
    })),
    createAnimatedComponent: jest.fn(component => component),
    event: jest.fn(() => jest.fn()),
    useNativeDriver: true,
  };

  // Mock the Keyboard API
  RN.Keyboard = {
    ...RN.Keyboard,
    dismiss: jest.fn(),
    addListener: jest.fn(() => ({remove: jest.fn()})),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
    scheduleLayoutAnimation: jest.fn(),
  };

  // Mock Alert API
  RN.Alert = {
    ...RN.Alert,
    alert: jest.fn(),
    prompt: jest.fn(),
  };

  // Mock Linking API
  RN.Linking = {
    ...RN.Linking,
    openURL: jest.fn(() => Promise.resolve()),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
    getInitialURL: jest.fn(() => Promise.resolve(null)),
    addEventListener: jest.fn(() => ({remove: jest.fn()})),
    removeEventListener: jest.fn(),
  };

  // Mock Image API
  RN.Image = {
    ...RN.Image,
    getSize: jest.fn((uri, success, failure) => success(100, 100)),
    prefetch: jest.fn(() => Promise.resolve()),
    resolveAssetSource: jest.fn(source => ({
      uri: source,
      width: 100,
      height: 100,
    })),
  };

  // Mock other commonly used components
  const createMockComponent = name => {
    const component = props => ({
      type: name,
      props,
      $$typeof: Symbol.for('react.element'),
    });
    component.displayName = name;
    return component;
  };

  // Add mock components
  RN.View = createMockComponent('View');
  RN.Text = createMockComponent('Text');
  RN.TextInput = createMockComponent('TextInput');
  RN.ScrollView = createMockComponent('ScrollView');
  RN.TouchableOpacity = createMockComponent('TouchableOpacity');
  RN.TouchableHighlight = createMockComponent('TouchableHighlight');
  RN.TouchableWithoutFeedback = createMockComponent('TouchableWithoutFeedback');
  RN.ActivityIndicator = createMockComponent('ActivityIndicator');
  RN.FlatList = createMockComponent('FlatList');
  RN.SectionList = createMockComponent('SectionList');
  RN.Modal = createMockComponent('Modal');
  RN.Button = createMockComponent('Button');

  return RN;
});

// ============================================================
// 2. Geolocation Service Mock
// ============================================================

/**
 * Mock implementation for react-native-geolocation-service
 * Provides simulation for both success and error scenarios
 *
 * @example
 * // To simulate success in test:
 * require('react-native-geolocation-service').__simulateSuccess({ latitude: 40.7128, longitude: -74.0060 });
 *
 * // To simulate error in test:
 * require('react-native-geolocation-service').__simulateError({ code: 1, message: 'Location permission denied' });
 */
jest.mock('react-native-geolocation-service', () => {
  // Default mock location data
  const defaultLocation = {
    coords: {
      latitude: 37.7749,
      longitude: -122.4194,
      altitude: 0,
      accuracy: 5,
      altitudeAccuracy: 5,
      heading: 0,
      speed: 0,
    },
    timestamp: Date.now(),
  };

  // Mock error codes according to the spec
  const ERROR_CODES = {
    PERMISSION_DENIED: 1,
    POSITION_UNAVAILABLE: 2,
    TIMEOUT: 3,
    PLAY_SERVICE_NOT_AVAILABLE: 4,
    SETTINGS_NOT_SATISFIED: 5,
    INTERNAL_ERROR: -1,
  };

  // Create state for mocking different responses
  let mockLocationResponse = null;
  let mockErrorResponse = null;
  let watchIds = 0;
  const watchCallbacks = {};

  // Helper to determine the response (success, error, or default)
  const getResponse = (success, error) => {
    if (mockErrorResponse) {
      error && error(mockErrorResponse);
      return;
    }

    const location = mockLocationResponse || defaultLocation;
    success && success(location);
  };

  // Set up mock implementation
  const geolocationMock = {
    // Core API methods
    getCurrentPosition: jest.fn((success, error, options) => {
      setTimeout(() => getResponse(success, error), 0);
    }),

    watchPosition: jest.fn((success, error, options) => {
      const watchId = (++watchIds).toString();
      watchCallbacks[watchId] = {success, error};

      // Immediately return a location unless there's an error
      setTimeout(() => getResponse(success, error), 0);

      return watchId;
    }),

    clearWatch: jest.fn(watchId => {
      delete watchCallbacks[watchId];
    }),

    stopObserving: jest.fn(),

    // Constants
    PositionError: ERROR_CODES,

    // Test helpers for simulation
    __simulateSuccess: location => {
      mockLocationResponse = {
        ...defaultLocation,
        coords: {
          ...defaultLocation.coords,
          ...(location || {}),
        },
        timestamp: Date.now(),
      };
      mockErrorResponse = null;

      // Notify all active watchers
      Object.values(watchCallbacks).forEach(({success}) => {
        success && success(mockLocationResponse);
      });
    },

    __simulateError: error => {
      mockErrorResponse = {
        code: error?.code || ERROR_CODES.POSITION_UNAVAILABLE,
        message: error?.message || 'Position unavailable',
      };

      // Notify all active watchers
      Object.values(watchCallbacks).forEach(({error: errorCb}) => {
        errorCb && errorCb(mockErrorResponse);
      });
    },

    __resetMock: () => {
      mockLocationResponse = null;
      mockErrorResponse = null;
      watchIds = 0;
      Object.keys(watchCallbacks).forEach(key => delete watchCallbacks[key]);
    },
  };

  // Return both default export and named exports
  return {
    default: geolocationMock,
    ...geolocationMock,
  };
});

// ============================================================
// 3. Device Info Mock
// ============================================================

/**
 * Comprehensive mock for react-native-device-info
 * Provides all commonly used methods with appropriate return types
 *
 * @example
 * // To customize device info in tests:
 * require('react-native-device-info').__setMockValues({
 *   model: 'iPhone 13',
 *   systemVersion: '15.0',
 * });
 */
jest.mock('react-native-device-info', () => {
  // Default mock values
  const defaultMockValues = {
    apiLevel: 30,
    applicationName: 'HostAway',
    buildId: '1A2B3C',
    buildNumber: '42',
    bundleId: 'com.hostaway.app',
    carrier: 'T-Mobile',
    deviceId: 'iPhone12,1',
    deviceType: 'Handset',
    deviceName: 'iPhone',
    firstInstallTime: 1625097600000,
    fontScale: 1,
    freeDiskStorage: 20000000000,
    installReferrer: 'utm_source=google',
    instanceId: '123456789abcdef',
    lastUpdateTime: 1625097600000,
    manufacturer: 'Apple',
    maxMemory: 6000000000,
    model: 'iPhone 12',
    phoneNumber: '',
    powerState: {
      batteryLevel: 0.8,
      batteryState: 'charging',
      lowPowerMode: false,
    },
    readableVersion: '1.0.0 (42)',
    serialNumber: 'ABCDEF123456',
    systemName: 'iOS',
    systemVersion: '14.5',
    totalDiskCapacity: 64000000000,
    totalMemory: 8000000000,
    uniqueId: 'ABCDEF01-2345-6789-ABCD-EF0123456789',
    usedMemory: 2000000000,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_5 like Mac OS X)',
    version: '1.0.0',
    isEmulator: false,
    isTablet: false,
    hasNotch: true,
    hasGms: true,
    hasHms: false,
    isLandscape: false,
    isAirplaneMode: false,
    isBatteryCharging: true,
    isPinOrFingerprintSet: true,
    isHeadphonesConnected: false,
    isLocationEnabled: true,
    supported32BitAbis: ['armeabi-v7a'],
    supported64BitAbis: ['arm64-v8a'],
    supportedAbis: ['armeabi-v7a', 'arm64-v8a'],
  };

  // Current mock values (can be updated in tests)
  let mockValues = {...defaultMockValues};

  // Create a helper for generating mock methods
  const createMockMethod = (key, defaultValue, isAsync = false) => {
    if (isAsync) {
      return jest.fn(() => Promise.resolve(mockValues[key] ?? defaultValue));
    }
    return jest.fn(() => mockValues[key] ?? defaultValue);
  };

  // Core API object
  const deviceInfoMock = {
    // Synchronous methods
    getApplicationName: createMockMethod('applicationName', 'HostAway'),
    getBuildNumber: createMockMethod('buildNumber', '42'),
    getBundleId: createMockMethod('bundleId', 'com.hostaway.app'),
    getDeviceId: createMockMethod('deviceId', 'iPhone12,1'),
    getDeviceType: createMockMethod('deviceType', 'Handset'),
    getFontScale: createMockMethod('fontScale', 1),
    getModel: createMockMethod('model', 'iPhone 12'),
    getReadableVersion: createMockMethod('readableVersion', '1.0.0 (42)'),
    getSystemName: createMockMethod('systemName', 'iOS'),
    getSystemVersion: createMockMethod('systemVersion', '14.5'),
    getVersion: createMockMethod('version', '1.0.0'),
    isTablet: createMockMethod('isTablet', false),
    hasNotch: createMockMethod('hasNotch', true),
    isLandscape: createMockMethod('isLandscape', false),
    isEmulator: createMockMethod('isEmulator', false),

    // Asynchronous methods
    getApiLevel: createMockMethod('apiLevel', 30, true),
    getBaseOs: createMockMethod('baseOs', 'iOS', true),
    getBuildId: createMockMethod('buildId', '1A2B3C', true),
    getCarrier: createMockMethod('carrier', 'T-Mobile', true),
    getDeviceName: createMockMethod('deviceName', 'iPhone', true),
    getFirstInstallTime: createMockMethod(
      'firstInstallTime',
      1625097600000,
      true,
    ),
    getFreeDiskStorage: createMockMethod('freeDiskStorage', 20000000000, true),
    getHardware: createMockMethod('hardware', 'iPhone', true),
    getHost: createMockMethod('host', 'host', true),
    getIpAddress: createMockMethod('ipAddress', '192.168.1.1', true),
    getInstallReferrer: createMockMethod(
      'installReferrer',
      'utm_source=google',
      true,
    ),
    getInstanceId: createMockMethod('instanceId', '123456789abcdef', true),
    getLastUpdateTime: createMockMethod('lastUpdateTime', 1625097600000, true),
    getMacAddress: createMockMethod('macAddress', '02:00:00:00:00:00', true),
    getManufacturer: createMockMethod('manufacturer', 'Apple', true),
    getMaxMemory: createMockMethod('maxMemory', 6000000000, true),
    getPhoneNumber: createMockMethod('phoneNumber', '', true),
    getPowerState: createMockMethod(
      'powerState',
      {batteryLevel: 0.8, batteryState: 'charging', lowPowerMode: false},
      true,
    ),
    getProduct: createMockMethod('product', 'iPhone12,1', true),
    getSerialNumber: createMockMethod('serialNumber', 'ABCDEF123456', true),
    getSupportedAbis: createMockMethod(
      'supportedAbis',
      ['armeabi-v7a', 'arm64-v8a'],
      true,
    ),
    getSupported32BitAbis: createMockMethod(
      'supported32BitAbis',
      ['armeabi-v7a'],
      true,
    ),
    getSupported64BitAbis: createMockMethod(
      'supported64BitAbis',
      ['arm64-v8a'],
      true,
    ),
    getTotalDiskCapacity: createMockMethod(
      'totalDiskCapacity',
      64000000000,
      true,
    ),
    getTotalMemory: createMockMethod('totalMemory', 8000000000, true),
    getUniqueId: createMockMethod(
      'uniqueId',
      'ABCDEF01-2345-6789-ABCD-EF0123456789',
      true,
    ),
    getUsedMemory: createMockMethod('usedMemory', 2000000000, true),
    getUserAgent: createMockMethod(
      'userAgent',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_5 like Mac OS X)',
      true,
    ),
    isAirplaneMode: createMockMethod('isAirplaneMode', false, true),
    isBatteryCharging: createMockMethod('isBatteryCharging', true, true),
    isCameraPresent: createMockMethod('isCameraPresent', true, true),
    isHeadphonesConnected: createMockMethod(
      'isHeadphonesConnected',
      false,
      true,
    ),
    isLocationEnabled: createMockMethod('isLocationEnabled', true, true),
    isPinOrFingerprintSet: createMockMethod(
      'isPinOrFingerprintSet',
      true,
      true,
    ),
    hasGms: createMockMethod('hasGms', true, true),
    hasHms: createMockMethod('hasHms', false, true),

    // Event listeners
    addBatteryLevelListener: jest.fn(listener => {
      return {remove: jest.fn()};
    }),
    addPowerStateListener: jest.fn(listener => {
      return {remove: jest.fn()};
    }),

    // Test helpers
    __setMockValues: values => {
      mockValues = {...mockValues, ...values};
    },
    __resetMockValues: () => {
      mockValues = {...defaultMockValues};
    },
  };

  return deviceInfoMock;
});

// ============================================================
// 4. Network Info (NetInfo) Mock
// ============================================================

/**
 * Mock implementation for @react-native-community/netinfo
 * Provides simulation for different network states
 *
 * @example
 * // To simulate a Wi-Fi connection:
 * require('@react-native-community/netinfo').__setConnectionInfo({
 *   type: 'wifi',
 *   isConnected: true,
 *   isInternetReachable: true,
 *   details: { isConnectionExpensive: false, ssid: 'MyWiFi' }
 * });
 *
 * // To simulate being offline:
 * require('@react-native-community/netinfo').__setConnectionInfo({
 *   type: 'none',
 *   isConnected: false,
 *   isInternetReachable: false
 * });
 */
jest.mock('@react-native-community/netinfo', () => {
  // Network connection types
  const ConnectionType = {
    NONE: 'none',
    WIFI: 'wifi',
    CELLULAR: 'cellular',
    BLUETOOTH: 'bluetooth',
    ETHERNET: 'ethernet',
    WIMAX: 'wimax',
    VPN: 'vpn',
    OTHER: 'other',
    UNKNOWN: 'unknown',
  };

  // Cellular connection types
  const CellularGeneration = {
    '2G': '2g',
    '3G': '3g',
    '4G': '4g',
    '5G': '5g',
  };

  // Default connection info
  const defaultConnectionInfo = {
    type: ConnectionType.WIFI,
    isConnected: true,
    isInternetReachable: true,
    isConnectionExpensive: false,
    details: {
      isConnectionExpensive: false,
      cellularGeneration: null,
      ssid: 'Test-SSID',
      bssid: '00:00:00:00:00:00',
      strength: null,
      ipAddress: '192.168.1.100',
      subnet: '255.255.255.0',
      frequency: 5000, // 5GHz
    },
  };

  // Current connection state that can be updated in tests
  let connectionInfo = {...defaultConnectionInfo};
  // All active event listeners
  const listeners = new Set();

  // Helper to notify all listeners
  const notifyListeners = () => {
    listeners.forEach(listener => {
      listener(connectionInfo);
    });
  };

  // Mock API implementation
  const netInfoMock = {
    addEventListener: jest.fn(listener => {
      listeners.add(listener);

      // Immediately notify the listener of the current state
      setTimeout(() => listener(connectionInfo), 0);

      // Return a function to remove the listener
      return jest.fn(() => {
        listeners.delete(listener);
      });
    }),

    fetch: jest.fn(() => Promise.resolve(connectionInfo)),

    refresh: jest.fn(() => Promise.resolve(connectionInfo)),

    getConnectionInfo: jest.fn(() => Promise.resolve(connectionInfo)),

    // Constants
    ConnectionType,
    CellularGeneration,

    // Test helper methods
    __setConnectionInfo: info => {
      connectionInfo = {...connectionInfo, ...info};

      // If details are provided, merge them with existing details
      if (info.details) {
        connectionInfo.details = {...connectionInfo.details, ...info.details};
      }

      notifyListeners();
    },

    __resetConnectionInfo: () => {
      connectionInfo = {...defaultConnectionInfo};
      notifyListeners();
    },
  };

  return netInfoMock;
});

// ============================================================
// 5. AsyncStorage Mock
// ============================================================

/**
 * Mock implementation for @react-native-async-storage/async-storage
 * Provides a full in-memory storage implementation for testing
 *
 * @example
 * // To pre-populate storage:
 * require('@react-native-async-storage/async-storage').__setItems({
 *   '@MyApp:user': JSON.stringify({ id: 1, name: 'Test User' }),
 *   '@MyApp:token': 'test-token-value'
 * });
 *
 * // To simulate storage errors:
 * require('@react-native-async-storage/async-storage').__setError('Storage quota exceeded');
 */
jest.mock('@react-native-async-storage/async-storage', () => {
  // In-memory storage object
  let storage = {};
  // Error simulation
  let mockError = null;

  // Helper for handling errors
  const handleOperation = async operation => {
    if (mockError) {
      throw new Error(mockError);
    }
    return operation();
  };

  // Mock implementation
  const asyncStorageMock = {
    // Core API methods
    setItem: jest.fn((key, value) =>
      handleOperation(() => {
        storage[key] = value;
        return Promise.resolve();
      }),
    ),

    getItem: jest.fn(key =>
      handleOperation(() => {
        return Promise.resolve(storage[key] ?? null);
      }),
    ),

    removeItem: jest.fn(key =>
      handleOperation(() => {
        delete storage[key];
        return Promise.resolve();
      }),
    ),

    clear: jest.fn(() =>
      handleOperation(() => {
        storage = {};
        return Promise.resolve();
      }),
    ),

    getAllKeys: jest.fn(() =>
      handleOperation(() => {
        return Promise.resolve(Object.keys(storage));
      }),
    ),

    multiGet: jest.fn(keys =>
      handleOperation(() => {
        const values = keys.map(key => [key, storage[key] ?? null]);
        return Promise.resolve(values);
      }),
    ),

    multiSet: jest.fn(keyValuePairs =>
      handleOperation(() => {
        keyValuePairs.forEach(([key, value]) => {
          storage[key] = value;
        });
        return Promise.resolve();
      }),
    ),

    multiRemove: jest.fn(keys =>
      handleOperation(() => {
        keys.forEach(key => {
          delete storage[key];
        });
        return Promise.resolve();
      }),
    ),

    multiMerge: jest.fn(keyValuePairs =>
      handleOperation(() => {
        keyValuePairs.forEach(([key, value]) => {
          try {
            const existingValue = storage[key] ? JSON.parse(storage[key]) : {};
            const newValue = JSON.parse(value);
            storage[key] = JSON.stringify({...existingValue, ...newValue});
          } catch (e) {
            // If not JSON, just replace
            storage[key] = value;
          }
        });
        return Promise.resolve();
      }),
    ),

    // Test helper methods
    __getStorage: () => ({...storage}),

    __setItems: items => {
      storage = {...storage, ...items};
    },

    __clear: () => {
      storage = {};
      mockError = null;
    },

    __setError: error => {
      mockError = error;
    },

    __resetMock: () => {
      storage = {};
      mockError = null;
      Object.keys(asyncStorageMock).forEach(key => {
        if (
          typeof asyncStorageMock[key] === 'function' &&
          asyncStorageMock[key].mockClear
        ) {
          asyncStorageMock[key].mockClear();
        }
      });
    },
  };

  return asyncStorageMock;
});

// ============================================================
// 6. SafeArea Context Mock
// ============================================================

/**
 * Mock implementation for react-native-safe-area-context
 * Provides customizable insets for testing
 *
 * @example
 * // To customize safe area insets:
 * require('react-native-safe-area-context').__setInsets({
 *   top: 48,
 *   bottom: 34,
 *   left: 0,
 *   right: 0
 * });
 */
jest.mock('react-native-safe-area-context', () => {
  // Default insets - iPhone X style
  const defaultInsets = {
    top: 44,
    right: 0,
    bottom: 34,
    left: 0,
  };

  // Default frame
  const defaultFrame = {
    x: 0,
    y: 0,
    width: 375,
    height: 812,
  };

  // Current values that can be updated in tests
  let insets = {...defaultInsets};
  let frame = {...defaultFrame};

  // Create mock components and hooks
  const SafeAreaProvider = ({children}) => children;
  const SafeAreaConsumer = ({children}) => children(insets);

  const useSafeAreaInsets = jest.fn(() => insets);
  const useSafeAreaFrame = jest.fn(() => frame);

  // Mock implementation
  const safeAreaMock = {
    SafeAreaProvider,
    SafeAreaConsumer,
    SafeAreaView: ({children}) => children,
    useSafeAreaInsets,
    useSafeAreaFrame,

    // Test helper methods
    __setInsets: newInsets => {
      insets = {...insets, ...newInsets};
    },

    __setFrame: newFrame => {
      frame = {...frame, ...newFrame};
    },

    __resetMock: () => {
      insets = {...defaultInsets};
      frame = {...defaultFrame};
    },

    // The initial values
    initialMetrics: {
      insets: {...defaultInsets},
      frame: {...defaultFrame},
    },
  };

  return safeAreaMock;
});

// ============================================================
// 7. Haptic Feedback Mock
// ============================================================

/**
 * Mock implementation for react-native-haptic-feedback
 * Provides haptic feedback simulation for testing
 */
jest.mock('react-native-haptic-feedback', () => {
  // Record of all triggered haptics for testing
  const triggeredHaptics = [];

  // Mock implementation
  const hapticMock = {
    trigger: jest.fn((type, options) => {
      triggeredHaptics.push({type, options, timestamp: Date.now()});
    }),

    // Constants
    TriggerTypes: {
      IMPACT: 'impactLight',
      IMPACT_LIGHT: 'impactLight',
      IMPACT_MEDIUM: 'impactMedium',
      IMPACT_HEAVY: 'impactHeavy',
      NOTIFICATION_SUCCESS: 'notificationSuccess',
      NOTIFICATION_WARNING: 'notificationWarning',
      NOTIFICATION_ERROR: 'notificationError',
      SELECTION: 'selection',
    },

    // Test helper methods
    __getTriggeredHaptics: () => [...triggeredHaptics],

    __clearTriggeredHaptics: () => {
      triggeredHaptics.length = 0;
    },
  };

  return hapticMock;
});

// ============================================================
// 8. Image Handling and Animation Mocks
// ============================================================

/**
 * Mock implementation for react-native-fast-image
 * Simulates the FastImage component behavior (if installed)
 */
try {
  require.resolve('react-native-fast-image');
  jest.mock('react-native-fast-image', () => {
    const React = require('react');

    // Create mock component
    const FastImageComponent = props => {
      return React.createElement('FastImage', props);
    };

    // Add static properties and methods
    FastImageComponent.resizeMode = {
      CONTAIN: 'contain',
      COVER: 'cover',
      STRETCH: 'stretch',
      CENTER: 'center',
    };

    FastImageComponent.priority = {
      LOW: 'low',
      NORMAL: 'normal',
      HIGH: 'high',
    };

    FastImageComponent.cacheControl = {
      IMMUTABLE: 'immutable',
      WEB: 'web',
      CACHE_ONLY: 'cacheOnly',
    };

    // Add methods for preloading and clearing cache
    FastImageComponent.preload = jest.fn(sources => Promise.resolve());
    FastImageComponent.clearMemoryCache = jest.fn(() => Promise.resolve());
    FastImageComponent.clearDiskCache = jest.fn(() => Promise.resolve());

    return FastImageComponent;
  });
} catch (e) {
  // react-native-fast-image not installed, skip mock
}

/**
 * Mock implementation for lottie-react-native
 * Provides animation component simulation
 */
jest.mock('lottie-react-native', () => {
  const React = require('react');

  class AnimatedLottieView extends React.Component {
    play = jest.fn();
    reset = jest.fn();
    pause = jest.fn();
    resume = jest.fn();

    render() {
      return React.createElement('LottieView', this.props);
    }
  }

  return AnimatedLottieView;
});

/**
 * Mock for react-native-image-picker
 * Simulates image selection from camera or gallery
 *
 * @example
 * // To simulate a successful image selection:
 * require('react-native-image-picker').__setMockResponse({
 *   assets: [{
 *     uri: 'file:///path/to/image.jpg',
 *     type: 'image/jpeg',
 *     fileName: 'image.jpg',
 *     fileSize: 123456,
 *     width: 800,
 *     height: 600
 *   }]
 * });
 *
 * // To simulate cancellation:
 * require('react-native-image-picker').__setMockResponse({ didCancel: true });
 *
 * // To simulate error:
 * require('react-native-image-picker').__setMockResponse({ errorCode: 'camera_unavailable', errorMessage: 'Camera not available' });
 */
jest.mock('react-native-image-picker', () => {
  // Default mock response - cancelled
  const defaultResponse = {didCancel: true};

  // Current response to return
  let mockResponse = {...defaultResponse};

  // Mock implementation
  const imagePickerMock = {
    // Core API methods
    launchCamera: jest.fn(options => Promise.resolve(mockResponse)),
    launchImageLibrary: jest.fn(options => Promise.resolve(mockResponse)),

    // Legacy callback API for backward compatibility
    showImagePicker: jest.fn((options, callback) => {
      setTimeout(() => callback(mockResponse), 0);
    }),

    // Test helper methods
    __setMockResponse: response => {
      mockResponse = {...response};
    },

    __resetMockResponse: () => {
      mockResponse = {...defaultResponse};
    },

    // Constants
    ImageLibraryOptions: {
      mediaType: 'photo',
      maxWidth: 500,
      maxHeight: 500,
      quality: 0.9,
    },
    CameraOptions: {
      mediaType: 'photo',
      saveToPhotos: true,
      cameraType: 'back',
      includeBase64: false,
    },
    AssetsType: {
      PHOTOS: 'photo',
      VIDEOS: 'video',
      ALL: 'mixed',
    },
  };

  return imagePickerMock;
});

/**
 * Mock for react-native-reanimated
 * Provides animation utilities for React Native
 */
jest.mock('react-native-reanimated', () => {
  const Animated = require('react-native').Animated;

  // Create mock Reanimated API
  const Reanimated = {
    // Core Animated API from React Native
    ...Animated,

    // Reanimated specific API
    useSharedValue: jest.fn(initialValue => ({
      value: initialValue,
      addListener: jest.fn(() => ({remove: jest.fn()})),
    })),

    useDerivedValue: jest.fn(derivation => {
      const val = derivation();
      return {
        value: val,
        addListener: jest.fn(() => ({remove: jest.fn()})),
      };
    }),

    useAnimatedStyle: jest.fn(() => ({})),
    useAnimatedGestureHandler: jest.fn(() => ({})),
    useAnimatedScrollHandler: jest.fn(() => ({})),
    useAnimatedRef: jest.fn(() => ({current: null})),

    withTiming: jest.fn((toValue, config, callback) => {
      callback && callback(true);
      return toValue;
    }),

    withSpring: jest.fn((toValue, config, callback) => {
      callback && callback(true);
      return toValue;
    }),

    withDecay: jest.fn((config, callback) => {
      callback && callback(true);
      return 0;
    }),

    withDelay: jest.fn((delay, animation) => animation),
    withSequence: jest.fn((...animations) => animations[animations.length - 1]),
    withRepeat: jest.fn((animation, config) => animation),

    // Layout animations
    Layout: {
      springify: jest.fn(),
      easing: jest.fn(),
    },

    // Entry/exit animations
    FadeIn: {
      duration: jest.fn(() => ({springify: jest.fn()})),
      springify: jest.fn(),
    },
    FadeOut: {
      duration: jest.fn(() => ({springify: jest.fn()})),
      springify: jest.fn(),
    },
    SlideInRight: jest.fn(),
    SlideOutRight: jest.fn(),
    SlideInLeft: jest.fn(),
    SlideOutLeft: jest.fn(),
    SlideInUp: jest.fn(),
    SlideOutUp: jest.fn(),
    SlideInDown: jest.fn(),
    SlideOutDown: jest.fn(),

    // Hooks for gesture handling
    Extrapolation: {
      CLAMP: 'clamp',
      EXTEND: 'extend',
      IDENTITY: 'identity',
    },
  };

  return Reanimated;
});

/**
 * Mock for react-native-gesture-handler
 * Provides gesture handling for React Native
 */
jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const RN = require('react-native');

  // Create simple component factory
  const createMockComponent = (name, extraProps = {}) => {
    const component = props => React.createElement(name, props);
    return Object.assign(component, {displayName: name, ...extraProps});
  };

  // Mock the gesture handlers
  const gestureHandlerMock = {
    // Basic components that wrap RN components
    TouchableOpacity: RN.TouchableOpacity,
    TouchableHighlight: RN.TouchableHighlight,
    TouchableWithoutFeedback: RN.TouchableWithoutFeedback,

    // Core components
    ScrollView: RN.ScrollView,
    FlatList: RN.FlatList,
    SectionList: RN.SectionList,
    TextInput: RN.TextInput,
    Switch: RN.Switch,

    // Specialized components
    PanGestureHandler: createMockComponent('PanGestureHandler', {
      attachTo: jest.fn(),
      activate: jest.fn(),
    }),
    TapGestureHandler: createMockComponent('TapGestureHandler', {
      attachTo: jest.fn(),
      activate: jest.fn(),
    }),
    LongPressGestureHandler: createMockComponent('LongPressGestureHandler', {
      attachTo: jest.fn(),
      activate: jest.fn(),
    }),
    RotationGestureHandler: createMockComponent('RotationGestureHandler', {
      attachTo: jest.fn(),
      activate: jest.fn(),
    }),
    PinchGestureHandler: createMockComponent('PinchGestureHandler', {
      attachTo: jest.fn(),
      activate: jest.fn(),
    }),
    ForceTouchGestureHandler: createMockComponent('ForceTouchGestureHandler', {
      attachTo: jest.fn(),
      activate: jest.fn(),
    }),
    NativeViewGestureHandler: createMockComponent('NativeViewGestureHandler', {
      attachTo: jest.fn(),
      activate: jest.fn(),
    }),

    // Utilities
    Swipeable: createMockComponent('Swipeable', {
      close: jest.fn(),
    }),
    DrawerLayout: createMockComponent('DrawerLayout', {
      openDrawer: jest.fn(),
      closeDrawer: jest.fn(),
    }),

    // State constants
    State: {
      UNDETERMINED: 0,
      FAILED: 1,
      BEGAN: 2,
      CANCELLED: 3,
      ACTIVE: 4,
      END: 5,
    },

    // Direction constants
    Direction: {
      RIGHT: 1,
      LEFT: 2,
      UP: 4,
      DOWN: 8,
    },

    // Utility methods
    enableGestureHandlerViewPanResponder: jest.fn(),
    enableGestureHandlerRootView: jest.fn(),
  };

  return gestureHandlerMock;
});

// ============================================================
// 9. Final Utility Mocks and Cleanup
// ============================================================

/**
 * Mock for react-native-vector-icons
 * Provides icon components for React Native
 */
jest.mock('react-native-vector-icons/Ionicons', () => {
  const React = require('react');
  const IconComponent = props => React.createElement('Icon', props);

  // Add methods used for button creation
  IconComponent.getImageSource = jest.fn((name, size, color) =>
    Promise.resolve({uri: `icon-${name}`}),
  );

  return IconComponent;
});

// Mock all icon fonts similarly
jest.mock('react-native-vector-icons/MaterialIcons', () =>
  require('react-native-vector-icons/Ionicons'),
);
jest.mock('react-native-vector-icons/FontAwesome', () =>
  require('react-native-vector-icons/Ionicons'),
);
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () =>
  require('react-native-vector-icons/Ionicons'),
);
jest.mock('react-native-vector-icons/Feather', () =>
  require('react-native-vector-icons/Ionicons'),
);

/**
 * Global error handler for unhandled promise rejections
 */
process.on('unhandledRejection', error => {
  console.error('UNHANDLED PROMISE REJECTION:', error);
});

/**
 * Global mock for timers to avoid timeout issues in tests
 */
jest.useFakeTimers();

// Export a test utilities object for convenience in tests
global.testUtils = {
  flushMicroTasks: async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
    jest.runAllTimers();
  },

  advanceTimersByTime: ms => {
    jest.advanceTimersByTime(ms);
  },

  // Helper for waiting for animations
  waitForAnimation: async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
    jest.runAllTimers();
  },

  // Helper to reset all mocks between tests
  resetAllMocks: () => {
    // Reset specific module mocks with custom reset methods
    try {
      require('react-native-geolocation-service').__resetMock();
    } catch (e) {}

    try {
      require('react-native-device-info').__resetMockValues();
    } catch (e) {}

    try {
      require('@react-native-community/netinfo').__resetConnectionInfo();
    } catch (e) {}

    try {
      require('@react-native-async-storage/async-storage').__resetMock();
    } catch (e) {}

    try {
      require('react-native-safe-area-context').__resetMock();
    } catch (e) {}

    try {
      require('react-native-haptic-feedback').__clearTriggeredHaptics();
    } catch (e) {}

    try {
      require('react-native-image-picker').__resetMockResponse();
    } catch (e) {}
  },
};

// Console overrides for cleaner test output
const originalConsoleError = console.error;
console.error = (...args) => {
  // Filter out specific React warnings that clutter test output
  if (
    args[0]?.includes?.('Warning: An update to') ||
    args[0]?.includes?.('Warning: Cannot update a component') ||
    args[0]?.includes?.('Warning: Each child in a list should have')
  ) {
    return;
  }

  originalConsoleError(...args);
};
