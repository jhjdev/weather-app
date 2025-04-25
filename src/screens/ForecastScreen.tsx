import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSelector } from 'react-redux';
import * as Icon from 'react-native-feather';
import Header from '../components/common/Header';
import { useWeather } from '../hooks/useWeather';

import { RootState } from '../store';
import { DailyForecast } from '../store/slices/weatherSlice';

// Helper function to format date from timestamp
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
};

// Component for each forecast day item
interface ForecastItemProps {
  item: DailyForecast;
}

const ForecastItem: React.FC<ForecastItemProps> = ({ item }) => {
  // Render appropriate weather icon based on condition
  const renderWeatherIcon = () => {
    const conditionId = item.condition.id;

    // Simplified condition mapping based on OpenWeatherMap condition codes
    // Simplified condition mapping based on OpenWeatherMap condition codes
    // See https://openweathermap.org/weather-conditions for all codes
    if (conditionId >= 200 && conditionId < 300) {
      // Thunderstorm
      return <Icon.CloudLightning stroke="#5D4037" width={32} height={32} />;
    } else if (conditionId >= 300 && conditionId < 400) {
      // Drizzle
      return <Icon.CloudDrizzle stroke="#1976D2" width={32} height={32} />;
    } else if (conditionId >= 500 && conditionId < 600) {
      // Rain
      return <Icon.CloudRain stroke="#1565C0" width={32} height={32} />;
    } else if (conditionId >= 600 && conditionId < 700) {
      // Snow
      return <Icon.CloudSnow stroke="#42A5F5" width={32} height={32} />;
    } else if (conditionId >= 700 && conditionId < 800) {
      // Atmosphere (fog, mist, etc.)
      return <Icon.CloudOff stroke="#607D8B" width={32} height={32} />;
    } else if (conditionId === 800) {
      // Clear sky
      return <Icon.Sun stroke="#FFC107" width={32} height={32} />;
    } else if (conditionId > 800 && conditionId < 900) {
      // Clouds
      return <Icon.Cloud stroke="#546E7A" width={32} height={32} />;
    } else {
      // Default icon if condition is not recognized
      return <Icon.Sun stroke="#FFD60A" width={32} height={32} />;
    }
  };

  return (
    <View style={styles.forecastItem}>
      <View style={styles.dateContainer}>
        <Text style={styles.dayText}>{formatDate(item.date).toUpperCase()}</Text>
      </View>

      <View style={styles.tempContainer}>
        <View style={styles.iconContainer}>
          {renderWeatherIcon()}
          <Text style={styles.conditionText}>{item.condition.main}</Text>
        </View>

        <View style={styles.temperatureRow}>
          <View style={styles.tempBlock}>
            <Text style={styles.tempLabel}>Min</Text>
            <Text style={styles.tempValue}>{Math.round(item.minTemp)}°</Text>
          </View>
          <View style={styles.tempBlock}>
            <Text style={styles.tempLabel}>Max</Text>
            <Text style={styles.tempValue}>{Math.round(item.maxTemp)}°</Text>
          </View>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Icon.Droplet stroke="#007AFF" width={16} height={16} />
          <Text style={styles.detailValue}>{item.humidity}%</Text>
        </View>
        <View style={styles.detailItem}>
          <Icon.Wind stroke="#007AFF" width={16} height={16} />
          <Text style={styles.detailValue}>{item.windSpeed} m/s</Text>
        </View>
      </View>
    </View>
  );
};

const ForecastScreen: React.FC = () => {
  const { forecast, isLoading, error, currentLocation } = useSelector(
    (state: RootState) => state.weather
  );
  const { loading, error: weatherError, refreshWeather } = useWeather();
  const [refreshing, setRefreshing] = React.useState<boolean>(false);

  // Handle pull-to-refresh
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshWeather();
    setRefreshing(false);
  }, [refreshWeather]);

  // Display loading indicator if forecast data is loading
  if (loading || isLoading.forecast) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="5-Day Forecast" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading forecast data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Display error message if there was an error fetching forecast
  if (error.forecast || weatherError) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="5-Day Forecast" />
        <View style={styles.errorContainer}>
          <Icon.AlertCircle stroke="#FF3B30" width={50} height={50} />
          <Text style={styles.errorText}>{error.forecast || weatherError}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Check if we have actual forecast data
  if (forecast.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="5-Day Forecast" />
        <View style={styles.errorContainer}>
          <Icon.Info stroke="#007AFF" width={50} height={50} />
          <Text style={styles.loadingText}>No forecast data available</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={refreshWeather}
          >
            <Text style={styles.retryButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <Header title="5-Day Forecast" />
      <View style={styles.locationContainer}>
        <Text style={styles.locationText}>
          {currentLocation ? currentLocation.city.toUpperCase() : 'CURRENT LOCATION'}
        </Text>
        <Text style={styles.locationSubtitle}>Weather Forecast</Text>
      </View>

      <FlatList
        data={forecast}
        keyExtractor={(item, index) => `forecast-${index}`}
        renderItem={({ item }) => <ForecastItem item={item} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
      />
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#8E8E93',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  locationContainer: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1565C0', // Material Design Blue 800 - consistent with HomeScreen
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  locationSubtitle: {
    fontSize: 14,
    color: '#757575', // Material Design Grey
    textAlign: 'center',
    marginBottom: 8,
  },
  listContainer: {
    padding: 16,
  },
  forecastItem: {
    backgroundColor: 'white',
    borderRadius: 8, // Material Design standard border radius
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  dateContainer: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    paddingBottom: 8,
    ...Platform.select({
      ios: {
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.06)',
      },
      android: {
        // Remove border and elevation for Android
        borderWidth: 0,
        elevation: 0,
        shadowRadius: 0,
        backgroundColor: 'transparent',
      },
    }),
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#388E3C', // Material Design Green 700 - better contrast with the UI
    letterSpacing: 0.5,
  },
  tempContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
    paddingHorizontal: 4,
  },
  iconContainer: {
    alignItems: 'center',
    width: '40%',
    padding: 4,
  },
  conditionText: {
    fontSize: 14,
    color: '#757575', // Material Design Grey
    marginTop: 6,
    fontWeight: '500',
  },
  temperatureRow: {
    flexDirection: 'row',
    width: '60%',
    justifyContent: 'space-around',
  },
  tempBlock: {
    alignItems: 'center',
  },
  tempLabel: {
    fontSize: 14,
    color: '#757575', // Material Design Grey
    marginBottom: 4,
  },
  tempValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#212121', // Material Design Dark Grey for better readability
    letterSpacing: 0.25, // Material Design typography spec
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    backgroundColor: 'rgba(0,0,0,0.02)', // Subtle background for details section
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginLeft: -16,
    marginRight: -16,
    marginBottom: -16,
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    marginHorizontal: 8,
  },
  detailValue: {
    color: '#212121', // Material Design Dark Grey
    marginLeft: 8,
    fontWeight: '500',
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ForecastScreen;
