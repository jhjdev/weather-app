import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../store';
import {loadCurrentUser} from '../store/slices/authSlice';

// Screen imports
import HomeScreen from '../screens/HomeScreen';
import ForecastScreen from '../screens/ForecastScreen';
import SearchScreen from '../screens/SearchScreen';
import AboutScreen from '../screens/AboutScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import EmailVerificationScreen from '../screens/auth/EmailVerificationScreen';

// Custom components
import CustomTabBar from '../components/navigation/CustomTabBar';
import Loading from '../components/common/Loading';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';

// Tab bar wrapper component to avoid inline function
const TabBarWrapper = (props: BottomTabBarProps) => <CustomTabBar {...props} />;

// Type definitions for the navigation
export type RootTabParamList = {
  Home: undefined;
  Forecast: undefined;
  Search: undefined;
  About: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  EmailVerification: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createStackNavigator<AuthStackParamList>();

// Auth Navigator for non-authenticated users
const AuthNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen
      name="EmailVerification"
      component={EmailVerificationScreen}
    />
  </Stack.Navigator>
);

// Main Tab Navigator for authenticated users
const MainTabNavigator: React.FC = () => (
  <Tab.Navigator
    tabBar={TabBarWrapper}
    screenOptions={{
      headerShown: false,
    }}>
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        title: 'Weather',
      }}
    />
    <Tab.Screen
      name="Search"
      component={SearchScreen}
      options={{
        title: 'Search',
      }}
    />
    <Tab.Screen
      name="Forecast"
      component={ForecastScreen}
      options={{
        title: 'Forecast',
      }}
    />
    <Tab.Screen
      name="About"
      component={AboutScreen}
      options={{
        title: 'About',
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        title: 'Profile',
      }}
    />
  </Tab.Navigator>
);

const AppNavigator: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {isAuthenticated, isLoading} = useSelector(
    (state: RootState) => state.auth,
  );

  // Load stored user on app start
  useEffect(() => {
    dispatch(loadCurrentUser());
  }, [dispatch]);

  // Show loading while checking authentication
  if (isLoading) {
    return <Loading />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator;
