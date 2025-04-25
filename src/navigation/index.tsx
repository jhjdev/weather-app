import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Calendar, Search, Info } from 'react-native-feather';

// Screen imports
import HomeScreen from '../screens/HomeScreen';
import ForecastScreen from '../screens/ForecastScreen';
import SearchScreen from '../screens/SearchScreen';
import AboutScreen from '../screens/AboutScreen';

// Type definitions for the navigation
export type RootTabParamList = {
  Home: undefined;
  Forecast: undefined;
  Search: undefined;
  About: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let icon;
            if (route.name === 'Home') {
              icon = <Home stroke={color} width={size} height={size} />;
            } else if (route.name === 'Forecast') {
              icon = <Calendar stroke={color} width={size} height={size} />;
            } else if (route.name === 'Search') {
              icon = <Search stroke={color} width={size} height={size} />;
            } else if (route.name === 'About') {
              icon = <Info stroke={color} width={size} height={size} />;
            }
            return icon;
          },
          tabBarActiveTintColor: '#007AFF', // Blue color
          tabBarInactiveTintColor: 'gray',
          headerShown: false, // Hide navigation header to use custom Header in each screen
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Weather',
          }}
        />
        <Tab.Screen
          name="Forecast"
          component={ForecastScreen}
          options={{
            title: '5-Day Forecast',
          }}
        />
        <Tab.Screen
          name="Search"
          component={SearchScreen}
          options={{
            title: 'Search Location',
          }}
        />
        <Tab.Screen
          name="About"
          component={AboutScreen}
          options={{
            title: 'About',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
