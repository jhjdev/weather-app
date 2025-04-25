import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

const Loading: React.FC = () => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color="#007AFF" />
    <Text style={styles.text}>Loading weather data...</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: '#8E8E93',
  },
});

export default Loading;

