import React from 'react';
import { ScrollView, SafeAreaView, StyleSheet, View, Text } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useWeather } from '../hooks/useWeather';
import { useThemedStyles } from '../styles/ThemeProvider';
import { Theme } from '../styles/theme';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import WeatherCard from '../components/weather/WeatherCard';
import Header from '../components/common/Header';

const HomeScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const { loading, error, refreshWeather } = useWeather();
  const { currentLocation, currentWeather } = useSelector(
    (state: RootState) => state.weather
  );

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refreshWeather} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Weather" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        bounces={true}
        showsVerticalScrollIndicator={false}
      >
        {currentLocation && currentWeather ? (
          <WeatherCard location={currentLocation} weather={currentWeather} />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No weather data available</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: theme.spacing.lg,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});

export default HomeScreen;
