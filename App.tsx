/**
 * HostAway Weather App
 * React Native Weather Forecast Application
 *
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar, Appearance } from 'react-native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { store, persistor } from './src/store';
import { updateSystemTheme } from './src/store/slices/themeSlice';
import { RootState } from './src/store';
import AppNavigator from './src/navigation';
import { getColors } from './src/theme/colors';
import { ThemeProvider } from './src/styles/ThemeProvider';

// Theme change listener component
const ThemeListener = () => {
  const dispatch = useDispatch();
  const mode = useSelector((state: RootState) => state.theme.mode);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      console.log('[Theme] System theme changed to:', colorScheme);
      console.log('[Theme] Current app theme mode:', mode);
      dispatch(updateSystemTheme());
    });

    // Log initial theme state
    console.log('[Theme] Initial system theme:', Appearance.getColorScheme());
    console.log('[Theme] Initial app theme mode:', mode);

    return () => {
      subscription.remove();
    };
  }, [dispatch, mode]);

  return null;
};

// App wrapper component with Navigation
const AppWrapper = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDark);
  const colors = getColors(isDarkMode);

  return (
    <ThemeProvider initialTheme={isDarkMode ? 'dark' : 'light'}>
      <ThemeListener />
      <StatusBar
        barStyle={colors.statusBar.style}
        backgroundColor={colors.statusBar.background}
        translucent={true}
      />
<AppNavigator />
    </ThemeProvider>
  );
};

// Root App component with Redux Provider
const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppWrapper />
      </PersistGate>
    </Provider>
  );
};

export default App;
