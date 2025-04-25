import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Icon from 'react-native-feather';
import { CurrentWeather, Location } from '../../store/slices/weatherSlice';

interface WeatherDisplayProps {
  currentLocation: Location | null;
  currentWeather: CurrentWeather | null;
}

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({
  currentLocation,
  currentWeather,
}) => (
  <View style={styles.container}>
    <Text style={styles.locationName}>
      {currentLocation ? currentLocation.city.toUpperCase() : 'UNKNOWN LOCATION'}
    </Text>
    <Text style={styles.locationSubtitle}>Current Weather Conditions</Text>

    <View style={styles.temperatureContainer}>
      <Text style={styles.temperature}>
        {currentWeather ? `${Math.round(currentWeather.temperature)}°` : '--°'}
      </Text>
      <Text style={styles.weatherCondition}>
        {currentWeather ? currentWeather.condition.main : '--'}
      </Text>
    </View>

    <View style={styles.detailsContainer}>
      <View style={styles.detailItem}>
        <Icon.Droplet stroke="#007AFF" width={24} height={24} />
        <Text style={styles.detailLabel}>Humidity</Text>
        <Text style={styles.detailValue}>
          {currentWeather ? `${currentWeather.humidity}%` : '--'}
        </Text>
      </View>

      <View style={styles.detailItem}>
        <Icon.Wind stroke="#007AFF" width={24} height={24} />
        <Text style={styles.detailLabel}>Wind</Text>
        <Text style={styles.detailValue}>
          {currentWeather ? `${currentWeather.windSpeed} m/s` : '--'}
        </Text>
      </View>

      <View style={styles.detailItem}>
        <Icon.Thermometer stroke="#007AFF" width={24} height={24} />
        <Text style={styles.detailLabel}>Feels Like</Text>
        <Text style={styles.detailValue}>
          {currentWeather ? `${Math.round(currentWeather.feelsLike)}°` : '--'}
        </Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  locationName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1565C0', // Material Design Blue 800 (darker blue)
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  locationSubtitle: {
    fontSize: 14,
    color: '#757575', // Material Design Grey
    marginBottom: 16,
  },
  temperatureContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  temperature: {
    fontSize: 80,
    fontWeight: '200',
    color: '#000',
  },
  weatherCondition: {
    fontSize: 24,
    color: '#8E8E93',
    marginTop: 10,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 30,
    paddingHorizontal: 10,
  },
  detailItem: {
    alignItems: 'center',
    width: '30%',
  },
  detailLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginTop: 4,
  },
});

export default WeatherDisplay;

