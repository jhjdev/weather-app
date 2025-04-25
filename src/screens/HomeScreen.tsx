import React from 'react';
import { ScrollView, SafeAreaView, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useWeather } from '../hooks/useWeather';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import WeatherDisplay from '../components/weather/WeatherDisplay';
import Header from '../components/common/Header';

const HomeScreen: React.FC = () => {
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
        <WeatherDisplay
          currentLocation={currentLocation}
          currentWeather={currentWeather}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
});

export default HomeScreen;
