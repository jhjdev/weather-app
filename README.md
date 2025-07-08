# HostAway

<p align="center">
  <img src="assets/images/logo.png" alt="HostAway Logo" width="200"/>
</p>

[![React Native](https://img.shields.io/badge/React%20Native-v0.79.1-blue.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.0.4-blue.svg)](https://www.typescriptlang.org/)
[![Redux](https://img.shields.io/badge/Redux-v5.0.1-purple.svg)](https://redux.js.org/)
[![React Navigation](https://img.shields.io/badge/React%20Navigation-v7-orange.svg)](https://reactnavigation.org/)

## Project Overview

This is a weather forecast application built with React Native as part of a technical test for HostAway. Developed by Jon Hnefill Jakobsson, this app provides current weather conditions and forecasts using the OpenWeatherMap API.

### Technical Test Requirements Checklist

#### Core Technologies

- ✅ React Native with TypeScript
- ✅ OpenWeatherMap API integration
- ✅ Redux for state management
- ✅ React Navigation
- ✅ Responsive design

#### Core Features

1. Location Search

   - ✅ City/location input
   - ✅ Autocomplete suggestions (bonus)
   - ✅ Save recent searches (bonus)

2. Current Weather Display

   - ✅ Temperature
   - ✅ Condition icons
   - ✅ Humidity
   - ✅ Wind speed
   - ✅ Feels like temperature

3. 5-Day Forecast

   - ✅ Daily forecast cards
   - ✅ Min/max temperatures
   - ✅ Weather conditions

4. Geolocation Support (bonus)
   - ✅ Automatic location detection
   - ✅ Manual location override

#### Bonus Features

- ✅ Unit tests
- ✅ Performance optimizations
- ✅ Error handling
- ✅ Clean architecture

### Development Challenges & Learnings

Throughout the development process, we encountered and overcame several challenges:

- **Location Permission Handling**: Implementing proper location permission flows across iOS and Android platforms required careful consideration of different OS behaviors.
- **OpenWeather API Integration**: Managing API rate limits and optimizing network requests to minimize data usage.
- **State Management Complexity**: Building a robust Redux store architecture with proper caching and persistence strategies.
- **Performance Optimization**: Ensuring smooth animations and transitions while maintaining fast load times and responsive UI.
- **Cross-Platform Consistency**: Addressing platform-specific UI and behavior differences to provide a consistent experience.

These challenges provided valuable learning opportunities in:

- Advanced React Native patterns
- Complex state management with Redux
- Geolocation implementation best practices
- API integration strategies
- Performance optimization techniques

## Tech Stack

### Core Technologies

- **React Native** (v0.79.1) - Core framework for building the mobile application
- **TypeScript** (v5.0.4) - For type-safe development
- **Redux** (@reduxjs/toolkit) - State management with Redux Toolkit
- **React Navigation** (v7) - Navigation management

### Key Libraries

- `react-native-geolocation-service` - Precise location services
- `react-native-fast-image` - Optimized image loading and caching
- `lottie-react-native` - High-quality animations
- `react-native-vector-icons` - Comprehensive icon set
- `redux-persist` - Persistent state management
- `react-native-reanimated` - Smooth animations
- `react-native-gesture-handler` - Touch handling
- `@react-native-async-storage/async-storage` - Local data storage

### Development Tools

- `jest` & `@testing-library/react-native` - Testing framework
- `eslint` & `prettier` - Code quality and formatting
- `react-native-dotenv` - Environment variable management

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios
```

#### Running on iOS Simulator

To specifically target the iOS simulator and avoid device provisioning issues, use these commands:

```sh
# Run in iPhone 16 Pro simulator (with Metro bundler)
npm run ios:sim

# Run in iPhone 16 Pro simulator (without Metro bundler)
npm run ios:sim:no-packager
```

These commands were added to handle common provisioning profile issues when running on simulators. Use `ios:sim` for normal development, and `ios:sim:no-packager` when you already have the Metro bundler running in another terminal.

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Location Services

### Current Implementation

The app **already includes full location services** with dynamic GPS-based weather fetching:

- **Dynamic Location**: Uses `react-native-geolocation-service` to get user's current coordinates
- **Permission Handling**: Automatic permission requests for iOS and Android
- **Fallback Location**: Copenhagen, Denmark for iOS simulator during development
- **Weather Integration**: Weather data fetched based on user's actual GPS location

### Location Configuration

**Default Behavior:**

- App requests location permissions on first launch
- Weather data is fetched for user's current GPS location
- Location is labeled as "Current Location" in the UI

**Development Mode:**

- iOS Simulator uses Copenhagen coordinates (55.6761, 12.5683) as fallback
- Real devices use actual GPS coordinates
- Android emulator requires location simulation in AVD settings

**To Use Manual Location Instead:**

If you want to switch to hardcoded location for testing:

1. Open `src/services/locationService.ts`
2. Modify the `getCurrentLocation` function to always return hardcoded coordinates:

```typescript
export const getCurrentLocation = async (): Promise<LocationCoordinates> => {
  // Always use hardcoded location (Stockholm example)
  return Promise.resolve({
    latitude: 59.3293,
    longitude: 18.0686,
  });
};
```

**Location Permissions:**

- iOS: Location access requested automatically via `Geolocation.requestAuthorization()`
- Android: Uses `PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION`
- Both platforms show appropriate permission dialogs

For comprehensive enhancement plans, see [WEATHER_APP_ENHANCEMENTS.md](./WEATHER_APP_ENHANCEMENTS.md).

## Environment Setup

### Environment Variables

HostAway requires specific environment variables to function properly. The app uses different environment configurations based on build type:

#### Environment Files

- `.env` - Environment file for local development
- `.env.example` - Template file with example values

Copy `.env.example` to `.env` and fill in your actual values for local development.

#### Required Environment Variables

| Variable              | Description                         | Example                          |
| --------------------- | ----------------------------------- | -------------------------------- |
| `OPENWEATHER_API_KEY` | API key for the OpenWeather service | `a1b2c3d4e5f6g7h8i9j0`           |
| `OPENWEATHER_API_URL` | Base URL for OpenWeather API        | `https://api.openweathermap.org` |

#### Setting Up Environment Files

1. Copy the example environment file to create your base configuration:

   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file with your API credentials:

   ```
   OPENWEATHER_API_KEY=your_api_key_here
   OPENWEATHER_API_URL=https://api.openweathermap.org
   ```

3. For different build environments, create copies with appropriate configurations:

   ```bash
   cp .env.example .env
   ```

4. Fill in your actual API keys and secrets in the `.env` file.

### Getting an OpenWeather API Key

1. Sign up at [OpenWeather](https://openweathermap.org/api)
2. Navigate to your account page and find the "API keys" tab
3. Generate a new API key (or use the default one provided)
4. Copy the key and paste it in your environment files
5. Note that new API keys may take a few hours to activate

## Project Structure

```
HostAway/
├── __tests__/           # Test files
│   ├── components/      # Component tests
│   ├── screens/         # Screen tests
│   └── utils/           # Utility tests
├── src/
│   ├── assets/          # Static assets
│   │   ├── images/      # Image files
│   │   └── animations/  # Lottie animation files
│   ├── components/      # Reusable components
│   ├── navigation/      # Navigation configuration
│   ├── screens/         # Screen components
│   ├── services/        # API and other services
│   ├── store/           # Redux store setup
│   │   ├── slices/      # Redux slices
│   │   └── index.ts     # Store configuration
│   ├── types/           # TypeScript types
│   └── utils/           # Utility functions
├── .env.example         # Environment variables template
└── App.tsx              # Application entry point
```

## Testing

HostAway uses Jest and React Native Testing Library for testing components, screens, and utilities.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- path/to/test-file.test.ts
```

### Test Examples

#### Component Testing

```typescript
import {render, fireEvent} from '@testing-library/react-native';
import WeatherCard from '../src/components/WeatherCard';

describe('WeatherCard', () => {
  it('displays weather information correctly', () => {
    const props = {
      temperature: 20,
      condition: 'Sunny',
      location: 'Stockholm',
    };

    const {getByText} = render(<WeatherCard {...props} />);

    expect(getByText('20°')).toBeTruthy();
    expect(getByText('Sunny')).toBeTruthy();
    expect(getByText('Stockholm')).toBeTruthy();
  });
});
```

#### Redux Testing

```typescript
import weatherReducer, {setWeather} from '../src/store/slices/weatherSlice';

describe('Weather Slice', () => {
  it('should handle initial state', () => {
    expect(weatherReducer(undefined, {type: 'unknown'})).toEqual({
      current: null,
      forecast: [],
      loading: false,
      error: null,
    });
  });
});
```

## Project-Specific Troubleshooting

### Common Issues

#### Location Services

If location services aren't working:

1. Check permissions in device settings
2. Ensure location services are enabled
3. Verify your app has the correct permissions in the manifest/info.plist
4. For Android, verify Google Play Services is installed and up to date

#### Weather API Issues

If weather data isn't loading:

1. Verify your API key in `.env`
2. Check your network connection
3. Confirm you haven't exceeded API rate limits
4. Check the API response in the network tab

#### Redux Persistence

If state isn't persisting:

1. Clear AsyncStorage:

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.clear();
```

2. Reset the Redux store:

```javascript
dispatch({type: 'RESET_STORE'});
```

#### Performance Issues

If experiencing slow performance:

1. Enable performance monitoring in development
2. Check image sizes and implement proper caching
3. Use Redux selectors efficiently
4. Implement proper list virtualization

#### Build Process

For native build issues:

1. Clean build folders:

```bash
# iOS
cd ios && xcodebuild clean
pod deintegrate
pod install

# Android
cd android && ./gradlew clean
```

2. Reset Metro cache:

```bash
npm start -- --reset-cache
```

3. Clear npm cache if needed:

```bash
npm cache clean --force
```

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
