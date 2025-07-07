import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {CurrentWeather, Location} from '../../../store/slices/weatherSlice';
import {useThemedStyles} from '../../../styles/ThemeProvider';
import {Theme} from '../../../styles/theme';
import * as Icon from 'react-native-feather';

interface WeatherCardProps {
  location: Location;
  weather: CurrentWeather;
}

const WeatherCard: React.FC<WeatherCardProps> = ({location, weather}) => {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.card}>
      <Text style={styles.locationName}>
        {location.city}, {location.country}
      </Text>

      <View style={styles.temperatureContainer}>
        <Text style={styles.temperature}>
          {Math.round(weather.temperature)}°
        </Text>
        <Text style={styles.feelsLike}>
          Feels like {Math.round(weather.feelsLike)}°
        </Text>
      </View>

      <View style={styles.conditionContainer}>
        <Icon.Sun width={40} height={40} stroke={styles.icon.color} />
        <Text style={styles.condition}>{weather.condition.main}</Text>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Icon.Droplet
            width={20}
            height={20}
            stroke={styles.detailIcon.color}
          />
          <Text style={styles.detailText}>Humidity {weather.humidity}%</Text>
        </View>
        <View style={styles.detailItem}>
          <Icon.Wind width={20} height={20} stroke={styles.detailIcon.color} />
          <Text style={styles.detailText}>Wind {weather.windSpeed} m/s</Text>
        </View>
      </View>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface.primary,
      margin: theme.spacing.md,
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.large,
      ...theme.shadows.medium,
    },
    locationName: {
      fontSize: theme.typography.sizes.xl,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
    },
    temperatureContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    temperature: {
      fontSize: theme.typography.sizes['5xl'],
      fontWeight: theme.typography.weights.light,
      color: theme.colors.text.primary,
    },
    feelsLike: {
      fontSize: theme.typography.sizes.base,
      fontWeight: theme.typography.weights.medium,
      color: theme.colors.text.secondary,
      marginLeft: theme.spacing.sm,
    },
    conditionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.md,
    },
    condition: {
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.regular,
      color: theme.colors.text.primary,
      marginLeft: theme.spacing.sm,
    },
    detailsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.spacing.lg,
    },
    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    detailText: {
      fontSize: theme.typography.sizes.sm,
      fontWeight: theme.typography.weights.regular,
      color: theme.colors.text.secondary,
      marginLeft: theme.spacing.sm,
    },
    icon: {
      color: theme.colors.weather.sunny,
    },
    detailIcon: {
      color: theme.colors.accent,
    },
  });

export default WeatherCard;
